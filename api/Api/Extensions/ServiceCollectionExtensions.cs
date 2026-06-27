using System.Text;
using Amazon.Runtime;
using Amazon.S3;
using Data;
using Data.Migrations;
using Data.Utilities;
using EfCoreRepository.Extensions;
using FluentMigrator.Runner;
using Logic.BackgroundJobs;
using Logic.Configs;
using Logic.Interfaces;
using Logic.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Models.Entities;

namespace Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddPersistence(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = ResolveConnectionString(configuration);

        AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

        services.AddDbContext<DatabaseContext>(opt => opt.UseNpgsql(connectionString));

        services.AddEfRepository<DatabaseContext>(x => x.Profile(typeof(DatabaseContext).Assembly));

        services.AddFluentMigratorCore()
            .ConfigureRunner(rb => rb
                .AddPostgres()
                .WithGlobalConnectionString(connectionString)
                .ScanIn(typeof(M20260626000001_InitialSchema).Assembly).For.Migrations())
            .AddLogging(lb => lb.AddFluentMigratorConsole());

        return services;
    }

    private static string ResolveConnectionString(IConfiguration configuration)
    {
        var databaseUrl = configuration.GetValue<string>("DATABASE_URL");

        if (!string.IsNullOrWhiteSpace(databaseUrl))
        {
            return databaseUrl.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase)
                   || databaseUrl.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase)
                ? ConnectionStringUtility.ConnectionStringUrlToPgResource(databaseUrl)
                : databaseUrl;
        }

        return configuration.GetConnectionString("Postgres")
            ?? throw new InvalidOperationException(
                "No database connection configured. Set the DATABASE_URL environment variable or ConnectionStrings:Postgres.");
    }

    public static IServiceCollection AddIdentityAndAuth(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddIdentity<User, Role>(options =>
            {
                options.User.RequireUniqueEmail = true;
                options.Password.RequiredLength = 6;
                options.Password.RequireNonAlphanumeric = false;
                options.Lockout.MaxFailedAccessAttempts = 5;
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
                // No email/account activation step — users can sign in right after registering.
                options.SignIn.RequireConfirmedAccount = false;
                options.SignIn.RequireConfirmedEmail = false;
                options.SignIn.RequireConfirmedPhoneNumber = false;
            })
            .AddEntityFrameworkStores<DatabaseContext>()
            .AddDefaultTokenProviders();

        var jwtSettings = configuration.GetSection("JwtSettings").Get<JwtSettings>() ?? new JwtSettings();
        jwtSettings.Key = configuration.GetValue<string>("JWT_SECRET")
            ?? (string.IsNullOrEmpty(jwtSettings.Key) ? "DevelopmentOnlyInsecureSigningKey_ChangeMe_1234567890" : jwtSettings.Key);

        services.AddSingleton(jwtSettings);

        services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = false;
                options.SaveToken = true;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = jwtSettings.Issuer,
                    ValidateAudience = true,
                    ValidAudience = jwtSettings.Audience,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key)),
                    ClockSkew = TimeSpan.FromMinutes(2)
                };
            });

        services.AddAuthorization();

        return services;
    }

    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.Scan(scan => scan
            .FromAssemblies(typeof(ListingService).Assembly)
            .AddClasses(classes => classes.Where(type => type.Namespace == "Logic.Services"))
            .AsImplementedInterfaces()
            .WithScopedLifetime());

        services.AddHostedService<ListingExpiryJob>();

        var s3Settings = configuration.GetSection("S3").Get<S3Settings>() ?? new S3Settings();

        s3Settings.AccessKey = configuration.GetValue<string>("SPACES_KEY") ?? s3Settings.AccessKey;
        s3Settings.SecretKey = configuration.GetValue<string>("SPACES_SECRET") ?? s3Settings.SecretKey;
        s3Settings.ServiceUrl = configuration.GetValue<string>("SPACES_ENDPOINT") ?? s3Settings.ServiceUrl;

        services.AddSingleton(s3Settings);

        services.AddSingleton<IAmazonS3>(_ =>
        {
            var config = new AmazonS3Config
            {
                ForcePathStyle = true,
                RetryMode = RequestRetryMode.Standard,
                RequestChecksumCalculation = RequestChecksumCalculation.WHEN_REQUIRED,
                ResponseChecksumValidation = ResponseChecksumValidation.WHEN_REQUIRED
            };

            if (!string.IsNullOrWhiteSpace(s3Settings.ServiceUrl))
            {
                config.ServiceURL = s3Settings.ServiceUrl;

                if (!string.IsNullOrWhiteSpace(s3Settings.Region))
                {
                    config.AuthenticationRegion = s3Settings.Region;
                }
            }
            else if (!string.IsNullOrWhiteSpace(s3Settings.Region))
            {
                config.RegionEndpoint = Amazon.RegionEndpoint.GetBySystemName(s3Settings.Region);
            }

            var credentials = new BasicAWSCredentials(s3Settings.AccessKey, s3Settings.SecretKey);
            return new AmazonS3Client(credentials, config);
        });

        return services;
    }

    public static IServiceCollection AddSwagger(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo { Title = "Yasaman Listing API", Version = "v1" });
            options.SchemaFilter<EnumSchemaFilter>();
            options.OperationFilter<FileUploadOperationFilter>();

            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                In = ParameterLocation.Header,
                Description = "Enter JWT token with the 'Bearer ' prefix.",
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "Bearer"
            });

            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
                    },
                    Array.Empty<string>()
                }
            });
        });

        return services;
    }
}

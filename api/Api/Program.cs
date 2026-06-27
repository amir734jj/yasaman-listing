using Api.Extensions;
using Api.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Serilog;
using Serilog.Events;

var builder = WebApplication.CreateBuilder(args);

// Structured logging via Serilog, enriched with the current username on every event.
builder.Host.UseSerilog((context, configuration) =>
{
    configuration
        .MinimumLevel.Information()
        .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
        .Enrich.FromLogContext()
        .Enrich.WithProperty("Application", "yasaman-listing-api")
        .Enrich.With(new UsernameEnricher(new HttpContextAccessor()))
        .WriteTo.Console(outputTemplate:
            "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}");
});

builder.Services.AddHttpContextAccessor();

builder.Services.AddPersistence(builder.Configuration);
builder.Services.AddIdentityAndAuth(builder.Configuration);
builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddSwagger();

builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
        options.SerializerSettings.Converters.Add(new StringEnumConverter());
    });

builder.Services.AddCors(options =>
{
    var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

    options.AddDefaultPolicy(policy => policy
        .WithOrigins(allowedOrigins)
        .AllowAnyHeader()
        .AllowAnyMethod());
});

var app = builder.Build();

// Log a concise, username-enriched entry per HTTP request.
app.UseSerilogRequestLogging();

// Serve the built React SPA (copied into wwwroot in the Docker image).
app.UseDefaultFiles();
app.UseStaticFiles();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseCors();
}

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

if (app.Environment.IsProduction())
{
    app.UseSpa(_ => { });
}

try
{
    await app.MigrateAndSeedAsync();
}
catch (Exception ex)
{
    app.Logger.LogError(ex, "Database migration/seed failed. The API will continue to start.");
}

await app.RunAsync();

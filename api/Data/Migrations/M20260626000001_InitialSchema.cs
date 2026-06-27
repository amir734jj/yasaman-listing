using System.Data;
using FluentMigrator;

namespace Data.Migrations;

/// <summary>
/// Initial schema: ASP.NET Identity tables (Guid keys) plus Listings, ListingMedia and GlobalConfigs.
/// Mirrors the model mapped by <see cref="DatabaseContext"/>.
/// </summary>
[Migration(20260626000001)]
public class M20260626000001_InitialSchema : Migration
{
    public override void Up()
    {
        Create.Table("AspNetRoles")
            .WithColumn("Id").AsGuid().NotNullable().PrimaryKey("PK_AspNetRoles")
            .WithColumn("Name").AsString(256).Nullable()
            .WithColumn("NormalizedName").AsString(256).Nullable()
            .WithColumn("ConcurrencyStamp").AsString().Nullable();

        Create.Table("AspNetUsers")
            .WithColumn("Id").AsGuid().NotNullable().PrimaryKey("PK_AspNetUsers")
            .WithColumn("DisplayName").AsString().Nullable()
            .WithColumn("Enabled").AsBoolean().NotNullable()
            .WithColumn("CreatedAt").AsDateTimeOffset().NotNullable()
            .WithColumn("UserName").AsString(256).Nullable()
            .WithColumn("NormalizedUserName").AsString(256).Nullable()
            .WithColumn("Email").AsString(256).Nullable()
            .WithColumn("NormalizedEmail").AsString(256).Nullable()
            .WithColumn("EmailConfirmed").AsBoolean().NotNullable()
            .WithColumn("PasswordHash").AsString().Nullable()
            .WithColumn("SecurityStamp").AsString().Nullable()
            .WithColumn("ConcurrencyStamp").AsString().Nullable()
            .WithColumn("PhoneNumber").AsString().Nullable()
            .WithColumn("PhoneNumberConfirmed").AsBoolean().NotNullable()
            .WithColumn("TwoFactorEnabled").AsBoolean().NotNullable()
            .WithColumn("LockoutEnd").AsDateTimeOffset().Nullable()
            .WithColumn("LockoutEnabled").AsBoolean().NotNullable()
            .WithColumn("AccessFailedCount").AsInt32().NotNullable();

        Create.Table("AspNetRoleClaims")
            .WithColumn("Id").AsInt32().NotNullable().PrimaryKey("PK_AspNetRoleClaims").Identity()
            .WithColumn("RoleId").AsGuid().NotNullable()
            .WithColumn("ClaimType").AsString().Nullable()
            .WithColumn("ClaimValue").AsString().Nullable();

        Create.Table("AspNetUserClaims")
            .WithColumn("Id").AsInt32().NotNullable().PrimaryKey("PK_AspNetUserClaims").Identity()
            .WithColumn("UserId").AsGuid().NotNullable()
            .WithColumn("ClaimType").AsString().Nullable()
            .WithColumn("ClaimValue").AsString().Nullable();

        Create.Table("AspNetUserLogins")
            .WithColumn("LoginProvider").AsString().NotNullable().PrimaryKey("PK_AspNetUserLogins")
            .WithColumn("ProviderKey").AsString().NotNullable().PrimaryKey("PK_AspNetUserLogins")
            .WithColumn("ProviderDisplayName").AsString().Nullable()
            .WithColumn("UserId").AsGuid().NotNullable();

        Create.Table("AspNetUserRoles")
            .WithColumn("UserId").AsGuid().NotNullable().PrimaryKey("PK_AspNetUserRoles")
            .WithColumn("RoleId").AsGuid().NotNullable().PrimaryKey("PK_AspNetUserRoles");

        Create.Table("AspNetUserTokens")
            .WithColumn("UserId").AsGuid().NotNullable().PrimaryKey("PK_AspNetUserTokens")
            .WithColumn("LoginProvider").AsString().NotNullable().PrimaryKey("PK_AspNetUserTokens")
            .WithColumn("Name").AsString().NotNullable().PrimaryKey("PK_AspNetUserTokens")
            .WithColumn("Value").AsString().Nullable();

        Create.Table("Listings")
            .WithColumn("Id").AsGuid().NotNullable().PrimaryKey("PK_Listings")
            .WithColumn("Name").AsString(200).NotNullable()
            .WithColumn("Description").AsString(4000).NotNullable()
            .WithColumn("Location").AsString(300).NotNullable()
            .WithColumn("Price").AsDecimal(18, 2).NotNullable()
            .WithColumn("Tags").AsCustom("jsonb").NotNullable().WithDefaultValue("[]")
            .WithColumn("Status").AsInt32().NotNullable()
            .WithColumn("SoldAt").AsDateTimeOffset().Nullable()
            .WithColumn("CreatedAt").AsDateTimeOffset().NotNullable()
            .WithColumn("UpdatedAt").AsDateTimeOffset().NotNullable()
            .WithColumn("OwnerId").AsGuid().NotNullable();

        Create.Table("ListingMedia")
            .WithColumn("Id").AsGuid().NotNullable().PrimaryKey("PK_ListingMedia")
            .WithColumn("ListingId").AsGuid().NotNullable()
            .WithColumn("Type").AsInt32().NotNullable()
            .WithColumn("StorageKey").AsString(500).NotNullable()
            .WithColumn("Order").AsInt32().NotNullable()
            .WithColumn("CreatedAt").AsDateTimeOffset().NotNullable();

        Create.Table("GlobalConfigs")
            .WithColumn("Id").AsGuid().NotNullable().PrimaryKey("PK_GlobalConfigs")
            .WithColumn("Key").AsString(256).NotNullable()
            .WithColumn("Value").AsString().Nullable();

        // Foreign keys (all cascade on delete, matching the EF model).
        Create.ForeignKey("FK_AspNetRoleClaims_AspNetRoles_RoleId")
            .FromTable("AspNetRoleClaims").ForeignColumn("RoleId")
            .ToTable("AspNetRoles").PrimaryColumn("Id").OnDelete(Rule.Cascade);

        Create.ForeignKey("FK_AspNetUserClaims_AspNetUsers_UserId")
            .FromTable("AspNetUserClaims").ForeignColumn("UserId")
            .ToTable("AspNetUsers").PrimaryColumn("Id").OnDelete(Rule.Cascade);

        Create.ForeignKey("FK_AspNetUserLogins_AspNetUsers_UserId")
            .FromTable("AspNetUserLogins").ForeignColumn("UserId")
            .ToTable("AspNetUsers").PrimaryColumn("Id").OnDelete(Rule.Cascade);

        Create.ForeignKey("FK_AspNetUserRoles_AspNetRoles_RoleId")
            .FromTable("AspNetUserRoles").ForeignColumn("RoleId")
            .ToTable("AspNetRoles").PrimaryColumn("Id").OnDelete(Rule.Cascade);

        Create.ForeignKey("FK_AspNetUserRoles_AspNetUsers_UserId")
            .FromTable("AspNetUserRoles").ForeignColumn("UserId")
            .ToTable("AspNetUsers").PrimaryColumn("Id").OnDelete(Rule.Cascade);

        Create.ForeignKey("FK_AspNetUserTokens_AspNetUsers_UserId")
            .FromTable("AspNetUserTokens").ForeignColumn("UserId")
            .ToTable("AspNetUsers").PrimaryColumn("Id").OnDelete(Rule.Cascade);

        Create.ForeignKey("FK_Listings_AspNetUsers_OwnerId")
            .FromTable("Listings").ForeignColumn("OwnerId")
            .ToTable("AspNetUsers").PrimaryColumn("Id").OnDelete(Rule.Cascade);

        Create.ForeignKey("FK_ListingMedia_Listings_ListingId")
            .FromTable("ListingMedia").ForeignColumn("ListingId")
            .ToTable("Listings").PrimaryColumn("Id").OnDelete(Rule.Cascade);

        // Indexes.
        Create.Index("IX_AspNetRoleClaims_RoleId").OnTable("AspNetRoleClaims").OnColumn("RoleId");
        Create.Index("RoleNameIndex").OnTable("AspNetRoles").OnColumn("NormalizedName").Unique();
        Create.Index("IX_AspNetUserClaims_UserId").OnTable("AspNetUserClaims").OnColumn("UserId");
        Create.Index("IX_AspNetUserLogins_UserId").OnTable("AspNetUserLogins").OnColumn("UserId");
        Create.Index("IX_AspNetUserRoles_RoleId").OnTable("AspNetUserRoles").OnColumn("RoleId");
        Create.Index("EmailIndex").OnTable("AspNetUsers").OnColumn("NormalizedEmail");
        Create.Index("UserNameIndex").OnTable("AspNetUsers").OnColumn("NormalizedUserName").Unique();
        Create.Index("IX_ListingMedia_ListingId").OnTable("ListingMedia").OnColumn("ListingId");
        Create.Index("IX_Listings_CreatedAt").OnTable("Listings").OnColumn("CreatedAt");
        Create.Index("IX_Listings_OwnerId").OnTable("Listings").OnColumn("OwnerId");
        Create.Index("IX_Listings_Status").OnTable("Listings").OnColumn("Status");
        Create.Index("IX_GlobalConfigs_Key").OnTable("GlobalConfigs").OnColumn("Key").Unique();
    }

    public override void Down()
    {
        Delete.Table("AspNetRoleClaims");
        Delete.Table("AspNetUserClaims");
        Delete.Table("AspNetUserLogins");
        Delete.Table("AspNetUserRoles");
        Delete.Table("AspNetUserTokens");
        Delete.Table("ListingMedia");
        Delete.Table("Listings");
        Delete.Table("GlobalConfigs");
        Delete.Table("AspNetRoles");
        Delete.Table("AspNetUsers");
    }
}

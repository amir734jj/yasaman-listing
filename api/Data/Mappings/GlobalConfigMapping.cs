using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Models.Entities;

namespace Data.Mappings;

public sealed class GlobalConfigMapping : IEntityTypeConfiguration<GlobalConfig>
{
    public void Configure(EntityTypeBuilder<GlobalConfig> builder)
    {
        builder.HasIndex(x => x.Key).IsUnique();
    }
}

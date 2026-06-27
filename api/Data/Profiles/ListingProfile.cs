using EfCoreRepository;
using Microsoft.EntityFrameworkCore;
using Models.Entities;

namespace Data.Profiles;

public class ListingProfile : EntityProfile<Listing>
{
    public ListingProfile()
    {
        Map(x => x.Name);
        Map(x => x.Description);
        Map(x => x.Location);
        Map(x => x.Price);
        Map(x => x.Tags);
        Map(x => x.Status);
        Map(x => x.SoldAt);
        Map(x => x.CreatedAt);
        Map(x => x.UpdatedAt);
        Map(x => x.OwnerId);
    }

    protected override IQueryable<Listing> Include<TQueryable>(TQueryable queryable)
    {
        return queryable
            .Include(x => x.Owner)
            .Include(x => x.Media.OrderBy(m => m.Order));
    }
}

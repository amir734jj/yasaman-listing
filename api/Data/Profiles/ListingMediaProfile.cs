using EfCoreRepository;
using Models.Entities;

namespace Data.Profiles;

public class ListingMediaProfile : EntityProfile<ListingMedia>
{
    public ListingMediaProfile()
    {
        Map(x => x.ListingId);
        Map(x => x.Type);
        Map(x => x.StorageKey);
        Map(x => x.Order);
        Map(x => x.CreatedAt);
    }
}

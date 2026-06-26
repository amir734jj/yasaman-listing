using EfCoreRepository;
using Models.Entities;

namespace Data.Profiles;

public class GlobalConfigProfile : EntityProfile<GlobalConfig>
{
    public GlobalConfigProfile()
    {
        Map(x => x.Key);
        Map(x => x.Value);
    }
}

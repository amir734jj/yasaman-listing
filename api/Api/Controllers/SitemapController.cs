using System.Xml.Linq;
using Logic.Dtos.Listing;
using Logic.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

/// <summary>
/// Generates <c>sitemap.xml</c> from the live listing data instead of a hardcoded file.
/// The public site URL is taken from <c>Seo:SiteUrl</c> config, falling back to the request origin.
/// </summary>
[ApiController]
[AllowAnonymous]
public class SitemapController : ControllerBase
{
    private static readonly XNamespace Ns = "http://www.sitemaps.org/schemas/sitemap/0.9";

    private readonly IListingService _listingService;
    private readonly IConfiguration _configuration;

    public SitemapController(IListingService listingService, IConfiguration configuration)
    {
        _listingService = listingService;
        _configuration = configuration;
    }

    [HttpGet("sitemap.xml")]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var siteUrl = (_configuration.GetValue<string>("Seo:SiteUrl")
                       ?? $"{Request.Scheme}://{Request.Host}").TrimEnd('/');

        var listings = await _listingService.SearchAsync(
            new ListingSearchRequest { Page = 1, PageSize = 5000 },
            cancellationToken);

        var urls = new List<XElement>
        {
            new(Ns + "url",
                new XElement(Ns + "loc", $"{siteUrl}/"),
                new XElement(Ns + "changefreq", "hourly"),
                new XElement(Ns + "priority", "1.0"))
        };

        urls.AddRange(listings.Items.Select(listing =>
            new XElement(Ns + "url",
                new XElement(Ns + "loc", $"{siteUrl}/listings/{listing.Id}"),
                new XElement(Ns + "lastmod", listing.CreatedAt.ToString("yyyy-MM-dd")),
                new XElement(Ns + "changefreq", "daily"))));

        var document = new XDocument(
            new XDeclaration("1.0", "UTF-8", null),
            new XElement(Ns + "urlset", urls));

        return Content($"{document.Declaration}{Environment.NewLine}{document}", "application/xml");
    }
}

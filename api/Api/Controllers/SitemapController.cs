using System.Text;
using System.Xml;
using System.Xml.Serialization;
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
    private const string SitemapNamespace = "http://www.sitemaps.org/schemas/sitemap/0.9";

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

        var urlSet = new SitemapUrlSet();
        urlSet.Urls.Add(new SitemapUrl
        {
            Location = $"{siteUrl}/",
            ChangeFrequency = "hourly",
            Priority = "1.0"
        });
        urlSet.Urls.AddRange(listings.Items.Select(listing => new SitemapUrl
        {
            Location = $"{siteUrl}/listings/{listing.Id}",
            LastModified = listing.CreatedAt.ToString("yyyy-MM-dd"),
            ChangeFrequency = "daily"
        }));

        return Content(Serialize(urlSet), "application/xml");
    }

    private static string Serialize(SitemapUrlSet urlSet)
    {
        var serializer = new XmlSerializer(typeof(SitemapUrlSet));
        var namespaces = new XmlSerializerNamespaces([new XmlQualifiedName(string.Empty, SitemapNamespace)]);

        using var writer = new Utf8StringWriter();
        using (var xmlWriter = XmlWriter.Create(writer, new XmlWriterSettings { Indent = true }))
        {
            serializer.Serialize(xmlWriter, urlSet, namespaces);
        }

        return writer.ToString();
    }

    private sealed class Utf8StringWriter : StringWriter
    {
        public override Encoding Encoding => Encoding.UTF8;
    }
}

[XmlRoot("urlset", Namespace = "http://www.sitemaps.org/schemas/sitemap/0.9")]
public class SitemapUrlSet
{
    [XmlElement("url")]
    public List<SitemapUrl> Urls { get; set; } = [];
}

public class SitemapUrl
{
    [XmlElement("loc")]
    public string Location { get; set; } = string.Empty;

    [XmlElement("lastmod")]
    public string? LastModified { get; set; }

    [XmlElement("changefreq")]
    public string? ChangeFrequency { get; set; }

    [XmlElement("priority")]
    public string? Priority { get; set; }
}


using System.Text;
using System.Xml;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using SlowPost;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors();
builder.WebHost.ConfigureKestrel(options =>
{
    options.ConfigureEndpointDefaults(lo => lo.Protocols = HttpProtocols.Http1AndHttp2);
    options.AllowSynchronousIO = true;
});

var app = builder.Build();

app.UseCors(options => options
    .AllowAnyMethod()
    .AllowAnyHeader()
    .WithOrigins("*"));

app.MapGet("/", () => "Slowposters unite!");
app.MapPost("/slow", () => new SlowResult());

app.MapPost("/stream", async (Stream body) =>
{
    
    // using var reader = new StreamReader(body);
    // while (!reader.EndOfStream)
    // {
    //     var len = body.Length;
    //     var buffer = new char[len];
    //     var line = new StringBuilder();
    //     var bytesRead = 0;
    //     do
    //     {
    //         bytesRead = await reader.ReadAsync(buffer, 0, buffer.Length);
    //         line.Append(buffer, 0, bytesRead);
    //         Console.WriteLine(line);
    //     } while (bytesRead == buffer.Length);
    // }
    // Console.WriteLine("Someone called?");

    string tempfile = Path.GetTempFileName();
    using var stream = File.OpenWrite(tempfile);
    Console.WriteLine("Got a stream, reading to file: " + tempfile);

    using var xstream = XmlReader.Create(body);
    //await body.CopyToAsync(stream2);
});

app.MapPost("/upload", () => "");

app.Run();

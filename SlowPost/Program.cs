
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors();
var app = builder.Build();

app.UseCors(options => options
    .AllowAnyMethod()
    .AllowAnyHeader()
    .WithOrigins("*"));

app.MapGet("/", () => "Slowposters unite!");
app.MapPost("/slow", () => new ChunkResult());

app.Run();

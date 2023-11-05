using SlowPost;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors();
var app = builder.Build();

app.UseCors(options => options
    .AllowAnyMethod()
    .AllowAnyHeader()
    .WithOrigins("*"));

app.MapGet("/", () => "Slowposters unite!");

app.MapPost("/slow", async (HttpContext context) =>
{
    Console.WriteLine("Slow request received");
    var body = await context.Request.ReadFromJsonAsync<SlowPokeRequest>();
    if(body is null)
    {
        return Results.BadRequest();
    }
    Console.WriteLine($"Quantity: {body.Quantity}");
    for(int i = 0; i < body.Quantity; i++)
    {
        await Task.Delay(1000);
        Console.WriteLine($"Iteration {i}");
    }
    return Results.Ok("Slow request completed");
});

app.Run();

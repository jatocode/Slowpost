using System.Globalization;
using SlowPost;
public sealed class ChunkResult : IResult
{
    public ChunkResult() { }

    public async Task ExecuteAsync(HttpContext context)
    {
        context.Response.ContentType = "text/plain"; // Or "application/json"

        var data = await context.Request.ReadFromJsonAsync<IEnumerable<SlowPokeRequest>>();
        if (data is null)
        {
            return;
        }
        double total = 0;
        foreach (var request in data)
        {
            await Task.Delay(1000);
            Console.WriteLine($"Message {request.Message}");
            total += Double.Parse(request.Message.Split(',')[1], CultureInfo.InvariantCulture);
            await context.Response.WriteAsync($"Message {request.Message}, Total:{total}");
        }
    }
}
using System.Globalization;
namespace SlowPost;
public class SlowResult : IResult
{
    public async Task ExecuteAsync(HttpContext context)
    {
        context.Response.ContentType = "text/plain"; // Or "application/json"

        var data = await context.Request.ReadFromJsonAsync<IAsyncEnumerable<SlowPokeRequest>>();
        Console.WriteLine("GOT IT ALL!");
        if (data is null)
        {
            return;
        }
        double total = 0;
        await foreach (var request in data)
        {
            await Task.Delay(1000);
            Console.WriteLine($"Message {request.Message}");
            total += Double.Parse(request.Message.Split(',')[1], CultureInfo.InvariantCulture);
            
            await context.Response.WriteAsync($"Total:{total} (Message: {request.Message})");
        }
    }
}
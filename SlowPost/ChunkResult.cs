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
        for (int i = 0; i < data.Count(); i++)
        {
            await Task.Delay(1000);
            Console.WriteLine($"Iteration {i}");
            await context.Response.WriteAsync($"Iteration {i}, message {data.ElementAt(i).Message}");
        }
    }
}
let iterations = 1000;

while (iterations > 0) {
  fetch("http://localhost:8080/register")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then((data) => {
      console.log(`Response received: ${data.length} characters`);
      // console.log("Response received successfully");
    })
    .catch((error) => {
      console.error("Error fetching data:", error, iterations);
      iterations = 0;
    });
  iterations--;
}

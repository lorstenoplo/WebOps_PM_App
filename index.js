const express = require("express");
const fs = require("fs");

const app = express();

const menuData = JSON.parse(fs.readFileSync("mess.json"));

app.get("/menu", (req, res) => {
  res.json(menuData);
});

// With filters
app.get("/menu/:item/:dayType/:day", (req, res) => {
  const { item, dayType, day } = req.params;
  if (
    menuData[item] &&
    menuData[item][dayType] &&
    menuData[item][dayType][day]
  ) {
    res.json(menuData[item][dayType][day]);
  } else {
    res.status(404).json({
      error: "Menu not found for the specified item, day type, and day",
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const databasePath = path.join(__dirname, "moviesData.db");

const app = express();
app.use(express.json());

let database = null;
const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at http://localhost:3000/");
    });
  } catch (err) {
    console.log(`DB Error:${err.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
  SELECT * FROM movie;`;
  const moviesArray = await database.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieQuery = `INSERT INTO movie(director_id, movie_name, lead_actor)
  VALUES(?, ?, ?);`;

  // Use a parameterized query to avoid SQL injection
  const movie = await database.run(
    postMovieQuery,
    directorId,
    movieName,
    leadActor
  );
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  console.log(movieId);
  const movieIdQuery = `SELECT * FROM MOVIE 
    WHERE movie_id=${movieId}`;
  const movie = await database.get(movieIdQuery);
  response.send({
    movieId: movie.movie_id,
    directorId: movie.director_id,
    movieName: movie.movie_name,
    leadActor: movie.lead_actor,
  });
});

app.put("/movies/:movieId", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovie = `UPDATE movie 
 SET director_id=?,movie_name=?,lead_actor=? 
 WHERE movie_id=?;`;
  await database.run(updateMovie, [directorId, movieName, leadActor, movieId]);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovie = `DELETE FROM movie WHERE 
   movie_id=?;`;
  await database.run(deleteMovie, [movieId]);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getMoviesQuery = `
  SELECT * FROM director;`;
  const moviesArray = await database.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({
      directorId: eachMovie.director_id,
      directorName: eachMovie.director_name,
    }))
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesQuery = `
  SELECT * FROM movie WHERE director_id=?;`;
  const moviesArray = await database.all(getMoviesQuery, directorId);
  response.send(
    moviesArray.map((eachMovie) => ({
      movieName: eachMovie.movie_name,
    }))
  );
});

module.exports = app;

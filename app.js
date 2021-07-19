const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//API 1

const convertdbObjtoResponseObj = (dbObj) => {
  return {
    movieName: dbObj.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMovieNames = `
      SELECT movie_name
      FROM movie ;`;
  const allMovieNames = await db.all(getMovieNames);
  response.send(allMovieNames.map((each) => convertdbObjtoResponseObj(each)));
});

//API 2
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const postMovie = `
       INSERT INTO 
          movie (director_id,movie_name,lead_actor)
       VALUES
          (
              ${directorId},
              '${movieName}',
              '${leadActor}',
          );`;
  const addedMovie = await db.run(postMovie);
  response.send("Movie Successfully Added");
});

//API 3
const convertSingleMovieObj = (dbObj) => {
  return {
    movieId: dbObj.movie_id,
    directorId: dbObj.director_id,
    movieName: dbObj.movie_name,
    leadActor: dbObj.lead_actor,
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT 
      *
    FROM 
      movie 
    WHERE 
      movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(convertSingleMovieObj(movie));
});

//API 4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovie = `
        UPDATE movie
        SET 
          director_id: ${directorId},
          movie_name = '${movieName}',
          lead_actor = '${leadActor}',
        WHERE
           movie_id = ${movieId};`;
  await db.run(updateMovie);
  response.send("Movie Details Updated");
});

//API 5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovie = `
      DELETE FROM 
          movie
      WHEN 
        movie_id = ${movieId};`;
  await db.run(deleteMovie);
  response.send("Movie Removed");
});

//API 6
const convertDirectorListObj = (dbObj) => {
  return {
    directorId: dbObj.director_id,
    directorName: dbObj.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getDirectors = `
        SELECT 
            *
        FROM director;`;
  const directorsList = await db.all(getDirectors);
  response.send(directorsList.map((each) => convertDirectorListObj(each)));
});

//API 7

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMovies = `
    SELECT
      movie_name
    FROM
      movie
    WHERE
      director_id= ${directorId};`;
  const moviesList = await db.all(getDirectorMovies);
  response.send(
    moviesList.map((eachDirectorMovie) => ({
      movieName: eachDirectorMovie.movie_name,
    }))
  );
});

module.exports = app;

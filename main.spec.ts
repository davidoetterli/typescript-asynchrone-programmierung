import { firstValueFrom } from "rxjs";
import {
  getLukeSkywalkerInfo,
  getLukeSkywalkerInfoAsync,
  getLukeSkywalkerInfoObservable,
  PersonInfo,
} from "./main";

const expectedResult: PersonInfo = {
  name: "Luke Skywalker",
  height: "172",
  gender: "male",
  homeworld: "Tatooine",
  films: [
    {
      title: "A New Hope",
      director: "George Lucas",
      release_date: "1977-05-25",
    },
    {
      title: "The Empire Strikes Back",
      director: "Irvin Kershner",
      release_date: "1980-05-17",
    },
    {
      title: "Return of the Jedi",
      director: "Richard Marquand",
      release_date: "1983-05-25",
    },
    {
      title: "Revenge of the Sith",
      director: "George Lucas",
      release_date: "2005-05-19",
    },
    // {
    //   title: "The Force Awakens",
    //   director: "J. J. Abrams",
    //   release_date: "2015-12-11"
    // },
  ],
};

test("getLukeSkywalkerInfo", () => {
  return getLukeSkywalkerInfo().then((result) => {
    expect(result).toStrictEqual(expectedResult);
  });
});

test("getLukeSkywalkerInfoAsync", async () => {
  const result = await getLukeSkywalkerInfoAsync();
  expect(result).toStrictEqual(expectedResult);
});

test("getLukeSkywalkerInfoObservable", async () => {
  const result = await firstValueFrom(getLukeSkywalkerInfoObservable());
  expect(result).toStrictEqual(expectedResult);
});

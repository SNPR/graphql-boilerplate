import "cross-fetch/polyfill";
import prisma from "../src/prisma";
import seedDatabase, { userOne } from "./utils/seedDatabase";
import getClient from "./utils/getClient";
import { createUser, getProfile, getUsers, login } from "./utils/operations";

const client = getClient();

jest.setTimeout(30000);

beforeEach(seedDatabase);

test("Should create a new user", async () => {
  const variables = {
    data: {
      name: "Sara",
      email: "sara@qwe.com",
      password: "qweasdqwe"
    }
  };

  const response = await client.mutate({
    mutation: createUser,
    variables
  });

  const exist = await prisma.exists.User({ id: response.data.createUser.user.id });
  expect(exist).toBe(true);
});

test("Should expose public author profiles", async () => {
  const response = await client.query({ query: getUsers });

  expect(response.data.users.length).toBe(2);
  expect(response.data.users[0].email).toBe(null);
  expect(response.data.users[0].name).toBe("Jen");
});

test("Should not login with bad credentials", async () => {
  const variables = {
    data: {
      email: "bob@qwe.com",
      password: "qweasdqwe"
    }
  };

  await expect(client.mutate({ mutation: login, variables })).rejects.toThrow();
});

test("Should not signup user with invalid password", async () => {
  const variables = {
    data: {
      name: "Oak",
      email: "oak@qwe.com",
      password: "qweasd"
    }
  };

  await expect(client.mutate({ mutation: createUser, variables })).rejects.toThrow();
});

test("Should fetch user profile", async () => {
  const client = getClient(userOne.jwt);
  const { data } = await client.query({ query: getProfile });

  expect(data.me.id).toBe(userOne.user.id);
  expect(data.me.name).toBe(userOne.user.name);
  expect(data.me.email).toBe(userOne.user.email);
});

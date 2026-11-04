import { test, expect } from "@playwright/test"

const baseUrl = "https://pokeapi.co/api/v2/"

// PokeAPI returns references to other resources as { name, url }
type NamedResource = { name: string; url: string }

test("get favorite pokemon and verify type", async ({ request }) => {
  let favoritePokemon: NamedResource | undefined;
  let pokemonFormURL: string;

  await test.step("get favorite pokemon", async () => {

    const response = await request.get(`${baseUrl}pokemon?limit=50&offset=0`)
    await expect(response).toBeOK()

    const data = await response.json()
    favoritePokemon = data.results.find((pokemon: NamedResource) => pokemon.name === "pikachu");
    expect(favoritePokemon, "pikachu should be in the first 50 results").toBeDefined()
  })

  await test.step("get pokemon form", async () => {
    const response = await request.get(`${favoritePokemon!.url}`)
    await expect(response).toBeOK()

    const pokemonForm = await response.json()
    pokemonFormURL = pokemonForm.forms[0].url
    // console.log('forms =', pokemonForm.forms, '| url =', pokemonFormURL)
  })

  await test.step("verify pokemon type", async () => {
    const response = await request.get(`${pokemonFormURL}`)
    await expect(response).toBeOK()

    const pokemonForm = await response.json()
    const pokemonType = pokemonForm.types[0].type.name
    // console.log('types =', pokemonForm.types, '| type =', pokemonType)
    expect(pokemonType).toBe('electric')
  })
})

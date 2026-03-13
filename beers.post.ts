export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    console.log(body); // Si je POST sur /api/movies le contenu “{"coucou": true}”, la variable body contiendra cela
})
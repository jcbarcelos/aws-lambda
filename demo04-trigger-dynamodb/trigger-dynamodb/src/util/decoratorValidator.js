const decoratorValitador = (fn, schema, argsType) => {
  return async function (event) {
    const data = JSON.parse(event[argsType]);
    //mostra todos os error de uma vez
    const { error, value } = await schema.validate(data, { abortEarly: true });
    //isso faz alterar a instancia de arguments
    event[argsType] = value;
    // arguments server para pegar todos os argumentos que vieram na funcao
    // e mandar para frente
    // o apply vai retornar a funcao qie sera executada posteriormente
    if (!error) return fn.apply(this, arguments);

    return {
      statusCode: 422, // unprocessable entity,
      body: error.message
    };
  };
};

module.exports = decoratorValitador;

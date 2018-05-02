function getFormatedTodos(todos) {
    let todosResponse = '';

    todos.forEach(todo => {
        todosResponse += `- ${todo.title} <br/>`;
    });

    return todosResponse;
}

export { getFormatedTodos };

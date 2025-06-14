// create simple json array data
export const data = [
    {
        "id": 1,
        "name": "John",
        "age": 30,
        "addresses": [
            { "id": 1, "street": "123 Main St", },
            { "id": 2, "street": "456 Elm St" }
        ]
    },
    {
        "id": 2,
        "name": "Jane",
        "age": 25,
        "addresses": [
            { "id": 1, "street": "789 Main St", },
            { "id": 2, "street": "987 Elm St" }
        ]
    },
    {
        "id": 3,
        "name": "Bob",
        "age": 40,
        "addresses": [
            { "id": 1, "street": "654 Main St", },
            { "id": 2, "street": "321 Elm St" }
        ]
    },
    {
        "id": 4,
        "name": "Mary",
        "age": 35,
        "addresses": [
            { "id": 1, "street": "000 Main St", },
            { "id": 2, "street": "111 Elm St" }
        ]
    },
    {
        "id": 5,
        "name": "Tom",
        "age": 20,
        "addresses": [
            { "id": 1, "street": "222 Main St", },
            { "id": 2, "street": "333 Elm St" }
        ]
    },
    {
        "id": 6,
        "name": "Jerry",
        "age": 25,
        "addresses": [
            { "id": 1, "street": "444 Main St", },
            { "id": 2, "street": "555 Elm St" }
        ]
    }
]

export type Data = typeof data
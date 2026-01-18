const Categories = require("../models/categories")
module.exports = {
  up: async (queryInterface, sequelize) => {
    return queryInterface.bulkInsert("Categories", [
      {
        CategoryID: 1,
        Category: "Amerikkalainen jalkapallo",
      },
      {
        CategoryID: 2,
        Category: "Avantouinti",
      },
      {
        CategoryID: 3,
        Category: "Biljardi",
      },
      {
        CategoryID: 4,
        Category: "Golf",
      },
      {
        CategoryID: 5,
        Category: "Jääkiekko",
      },
      {
        CategoryID: 6,
        Category: "Jalkapallo",
      },
      {
        CategoryID: 7,
        Category: "Juoksu",
      },
      {
        CategoryID: 8,
        Category: "Keilaus",
      },
      {
        CategoryID: 9,
        Category: "Koripallo",
      },
      {
        CategoryID: 10,
        Category: "Lentopallo",
      },
      {
        CategoryID: 11,
        Category: "Nyrkkeily",
      },
      {
        CategoryID: 12,
        Category: "Padel",
      },
      {
        CategoryID: 13,
        Category: "Pesapallo",
      },
      {
        CategoryID: 14,
        Category: "Pingis",
      },
      {
        CategoryID: 15,
        Category: "Puntti",
      },
      {
        CategoryID: 16,
        Category: "Pyoraily",
      },
      {
        CategoryID: 17,
        Category: "Sulkapallo",
      },
      {
        CategoryID: 18,
        Category: "Tennis",
      },
      {
        CategoryID: 19,
        Category: "Uinti",
      },
      {
        CategoryID: 20,
        Category: "Pihapelit",
      },
      {
        CategoryID: 21,
        Category: "Koiralenkki",
      },
      {
        CategoryID: 22,
        Category: "Salibandy",
      },
      {
        CategoryID: 23,
        Category: "Kiipeily",
      },
      {
        CategoryID: 24,
        Category: "Frisbeegolf",
      },
      {
        CategoryID: 25,
        Category: "Tanssi",
      },
      {
        CategoryID: 26,
        Category: "Yleisurheilu",
      },
    ])
  },

  down: async (queryInterface, sequelize) => {
    return queryInterface.bulkDelete("Categories", null, {})
  },
}
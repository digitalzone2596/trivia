// 100 Niveles adicionales generados de crucigrama sin repetición
export interface WordItem {
  id: number;
  word: string;
  row: number;
  col: number;
  dir: 'H' | 'V';
  hasStars?: boolean;
}

export interface LevelData {
  id: number;
  name: string;
  letters: string[];
  words: WordItem[];
}

export const ADDITIONAL_100_LEVELS: LevelData[] = [
  {
    "id": 4,
    "name": "Nivel 4 - Río Cristalino",
    "letters": [
      "O",
      "R",
      "I",
      "L",
      "L",
      "A"
    ],
    "words": [
      {
        "id": 1,
        "word": "ORILLA",
        "row": 2,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "LIRA",
        "row": 0,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "RIO",
        "row": 0,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "OLA",
        "row": 2,
        "col": 0,
        "dir": "V"
      }
    ]
  },
  {
    "id": 5,
    "name": "Nivel 5 - Lluvia Fresca",
    "letters": [
      "L",
      "L",
      "U",
      "V",
      "I",
      "A"
    ],
    "words": [
      {
        "id": 1,
        "word": "LLUVIA",
        "row": 2,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "LILA",
        "row": 2,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "VALI",
        "row": 0,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "VIA",
        "row": 2,
        "col": 3,
        "dir": "V"
      }
    ]
  },
  {
    "id": 6,
    "name": "Nivel 6 - Viento del Norte",
    "letters": [
      "V",
      "I",
      "E",
      "N",
      "T",
      "O"
    ],
    "words": [
      {
        "id": 1,
        "word": "VIENTO",
        "row": 1,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "VINO",
        "row": 1,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "NETO",
        "row": 0,
        "col": 2,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "TINO",
        "row": 0,
        "col": 1,
        "dir": "V"
      }
    ]
  },
  {
    "id": 7,
    "name": "Nivel 7 - Tierra Fértil",
    "letters": [
      "T",
      "I",
      "E",
      "R",
      "R",
      "A"
    ],
    "words": [
      {
        "id": 1,
        "word": "TIERRA",
        "row": 2,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "ARTE",
        "row": 0,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "REIR",
        "row": 0,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "TIRA",
        "row": 0,
        "col": 3,
        "dir": "V"
      }
    ]
  },
  {
    "id": 8,
    "name": "Nivel 8 - Playa Dorada",
    "letters": [
      "P",
      "L",
      "A",
      "Y",
      "A",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "PLAYAS",
        "row": 2,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "PLAYA",
        "row": 2,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "PALA",
        "row": 0,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "SALA",
        "row": 1,
        "col": 2,
        "dir": "V"
      }
    ]
  },
  {
    "id": 9,
    "name": "Nivel 9 - Brisa Marina",
    "letters": [
      "B",
      "R",
      "I",
      "S",
      "A",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "BRISAS",
        "row": 1,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "BRISA",
        "row": 1,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "RISA",
        "row": 1,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "SIRA",
        "row": 0,
        "col": 2,
        "dir": "V"
      }
    ]
  },
  {
    "id": 10,
    "name": "Nivel 10 - Arena Cálida",
    "letters": [
      "A",
      "R",
      "E",
      "N",
      "A",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "ARENAS",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "ARENA",
        "row": 3,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "SANA",
        "row": 0,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "AREA",
        "row": 2,
        "col": 1,
        "dir": "V"
      }
    ]
  },
  {
    "id": 11,
    "name": "Nivel 11 - Océano Azul",
    "letters": [
      "O",
      "C",
      "E",
      "A",
      "N",
      "O"
    ],
    "words": [
      {
        "id": 1,
        "word": "OCEANO",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "CANO",
        "row": 0,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "CENA",
        "row": 3,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "CONO",
        "row": 1,
        "col": 4,
        "dir": "V"
      }
    ]
  },
  {
    "id": 12,
    "name": "Nivel 12 - Valle Verde",
    "letters": [
      "V",
      "A",
      "L",
      "L",
      "E",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "VALLES",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "VALLE",
        "row": 3,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "VELA",
        "row": 0,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "LEVA",
        "row": 1,
        "col": 0,
        "dir": "V"
      }
    ]
  },
  {
    "id": 13,
    "name": "Nivel 13 - Costa Dorada",
    "letters": [
      "C",
      "O",
      "S",
      "T",
      "A",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "COSTAS",
        "row": 2,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "COSTA",
        "row": 2,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "TACO",
        "row": 0,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "SOTA",
        "row": 1,
        "col": 1,
        "dir": "V"
      }
    ]
  },
  {
    "id": 14,
    "name": "Nivel 14 - Monte Alto",
    "letters": [
      "M",
      "O",
      "N",
      "T",
      "E",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "MONTES",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "MONTE",
        "row": 3,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "NETO",
        "row": 0,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "TOME",
        "row": 2,
        "col": 1,
        "dir": "V"
      }
    ]
  },
  {
    "id": 15,
    "name": "Nivel 15 - Campo Abierto",
    "letters": [
      "C",
      "A",
      "M",
      "P",
      "O",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "CAMPOS",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "CAMPO",
        "row": 3,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "COPA",
        "row": 0,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "SOPA",
        "row": 1,
        "col": 3,
        "dir": "V"
      }
    ]
  },
  {
    "id": 16,
    "name": "Nivel 16 - Nieve Pura",
    "letters": [
      "N",
      "I",
      "E",
      "V",
      "E",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "NIEVES",
        "row": 1,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "NIEVE",
        "row": 1,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "VINE",
        "row": 0,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "SEVE",
        "row": 0,
        "col": 2,
        "dir": "V"
      }
    ]
  },
  {
    "id": 17,
    "name": "Nivel 17 - Hielo Polar",
    "letters": [
      "H",
      "I",
      "E",
      "L",
      "O",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "HIELOS",
        "row": 1,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "HIELO",
        "row": 1,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "HILO",
        "row": 0,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "SELO",
        "row": 0,
        "col": 2,
        "dir": "V"
      }
    ]
  },
  {
    "id": 18,
    "name": "Nivel 18 - Isla Coral",
    "letters": [
      "C",
      "O",
      "R",
      "A",
      "L"
    ],
    "words": [
      {
        "id": 1,
        "word": "CORAL",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "ROCA",
        "row": 1,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "ARCO",
        "row": 0,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "COLA",
        "row": 2,
        "col": 1,
        "dir": "V"
      }
    ]
  },
  {
    "id": 19,
    "name": "Nivel 19 - Luz de Luna",
    "letters": [
      "L",
      "U",
      "N",
      "A",
      "R",
      "E",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "LUNAR",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "LUNA",
        "row": 3,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "REAL",
        "row": 0,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "RUSA",
        "row": 2,
        "col": 1,
        "dir": "V"
      }
    ]
  },
  {
    "id": 20,
    "name": "Nivel 20 - Astro Brillante",
    "letters": [
      "A",
      "S",
      "T",
      "R",
      "O",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "ASTROS",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "ASTRO",
        "row": 3,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "RATO",
        "row": 1,
        "col": 2,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "ROSA",
        "row": 0,
        "col": 0,
        "dir": "V"
      }
    ]
  },
  {
    "id": 21,
    "name": "Nivel 21 - Cometa Fugaz",
    "letters": [
      "C",
      "O",
      "M",
      "E",
      "T",
      "A"
    ],
    "words": [
      {
        "id": 1,
        "word": "COMETA",
        "row": 1,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "META",
        "row": 1,
        "col": 2,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "MOTE",
        "row": 0,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "COMA",
        "row": 1,
        "col": 0,
        "dir": "V"
      }
    ]
  },
  {
    "id": 22,
    "name": "Nivel 22 - Planeta Azul",
    "letters": [
      "P",
      "L",
      "A",
      "N",
      "E",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "PLANES",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "PLAN",
        "row": 3,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "PENA",
        "row": 0,
        "col": 2,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "LEAN",
        "row": 3,
        "col": 1,
        "dir": "V"
      }
    ]
  },
  {
    "id": 23,
    "name": "Nivel 23 - Galaxia Lejana",
    "letters": [
      "G",
      "A",
      "L",
      "A",
      "X",
      "I"
    ],
    "words": [
      {
        "id": 1,
        "word": "GALAXI",
        "row": 2,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "GALA",
        "row": 2,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "LIGA",
        "row": 0,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "AGIL",
        "row": 2,
        "col": 1,
        "dir": "V"
      }
    ]
  },
  {
    "id": 24,
    "name": "Nivel 24 - Sol Radiante",
    "letters": [
      "S",
      "O",
      "L",
      "A",
      "N",
      "O"
    ],
    "words": [
      {
        "id": 1,
        "word": "SOLANO",
        "row": 2,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "SOLA",
        "row": 2,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "LONA",
        "row": 1,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "OSAN",
        "row": 0,
        "col": 3,
        "dir": "V"
      }
    ]
  },
  {
    "id": 25,
    "name": "Nivel 25 - Cosmos Infinito",
    "letters": [
      "C",
      "O",
      "S",
      "M",
      "O",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "COSMOS",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "MOCO",
        "row": 1,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "OSOS",
        "row": 3,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "SOMO",
        "row": 0,
        "col": 1,
        "dir": "V"
      }
    ]
  },
  {
    "id": 26,
    "name": "Nivel 26 - Aurora Boreal",
    "letters": [
      "A",
      "U",
      "R",
      "O",
      "R",
      "A"
    ],
    "words": [
      {
        "id": 1,
        "word": "AURORA",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "RARO",
        "row": 2,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "AURA",
        "row": 0,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "RORA",
        "row": 3,
        "col": 2,
        "dir": "V"
      }
    ]
  },
  {
    "id": 27,
    "name": "Nivel 27 - Nébula Mágica",
    "letters": [
      "N",
      "E",
      "B",
      "U",
      "L",
      "A"
    ],
    "words": [
      {
        "id": 1,
        "word": "NEBULA",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "LUNA",
        "row": 1,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "NUBE",
        "row": 0,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "BULA",
        "row": 3,
        "col": 2,
        "dir": "V"
      }
    ]
  },
  {
    "id": 28,
    "name": "Nivel 28 - Cielo Estrellado",
    "letters": [
      "C",
      "I",
      "E",
      "L",
      "O",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "CIELOS",
        "row": 1,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "CIELO",
        "row": 1,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "ECOS",
        "row": 1,
        "col": 2,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "SECO",
        "row": 0,
        "col": 2,
        "dir": "V"
      }
    ]
  },
  {
    "id": 29,
    "name": "Nivel 29 - Órbita Circular",
    "letters": [
      "O",
      "R",
      "B",
      "I",
      "T",
      "A"
    ],
    "words": [
      {
        "id": 1,
        "word": "ORBITA",
        "row": 2,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "BOTA",
        "row": 1,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "RATO",
        "row": 2,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "TIRA",
        "row": 0,
        "col": 1,
        "dir": "V"
      }
    ]
  },
  {
    "id": 30,
    "name": "Nivel 30 - Eclipse Solar",
    "letters": [
      "C",
      "L",
      "I",
      "P",
      "E",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "CLIPES",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "CLIP",
        "row": 3,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "PIEL",
        "row": 0,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "PELI",
        "row": 0,
        "col": 2,
        "dir": "V"
      }
    ]
  },
  {
    "id": 31,
    "name": "Nivel 31 - Centella Rápida",
    "letters": [
      "C",
      "E",
      "N",
      "T",
      "E",
      "L"
    ],
    "words": [
      {
        "id": 1,
        "word": "CENTEL",
        "row": 2,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "TELE",
        "row": 1,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "LENT",
        "row": 0,
        "col": 2,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "CENE",
        "row": 2,
        "col": 0,
        "dir": "V"
      }
    ]
  },
  {
    "id": 32,
    "name": "Nivel 32 - Zenit Iluminado",
    "letters": [
      "Z",
      "E",
      "N",
      "I",
      "T",
      "A"
    ],
    "words": [
      {
        "id": 1,
        "word": "ZENITA",
        "row": 2,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "TINA",
        "row": 0,
        "col": 2,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "NITA",
        "row": 1,
        "col": 3,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "ZETA",
        "row": 2,
        "col": 0,
        "dir": "V"
      }
    ]
  },
  {
    "id": 33,
    "name": "Nivel 33 - Horizonte Lejano",
    "letters": [
      "R",
      "O",
      "N",
      "T",
      "E",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "RONTES",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "RETO",
        "row": 3,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "NETO",
        "row": 0,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "ROTE",
        "row": 1,
        "col": 3,
        "dir": "V"
      }
    ]
  },
  {
    "id": 34,
    "name": "Nivel 34 - Roble Sagrado",
    "letters": [
      "R",
      "O",
      "B",
      "L",
      "E",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "ROBLES",
        "row": 1,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "ROBLE",
        "row": 1,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "SOBRE",
        "row": 0,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "BOLE",
        "row": 1,
        "col": 2,
        "dir": "V"
      }
    ]
  },
  {
    "id": 35,
    "name": "Nivel 35 - Sendero Verde",
    "letters": [
      "S",
      "E",
      "N",
      "D",
      "A",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "SENDAS",
        "row": 1,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "SENDA",
        "row": 1,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "SEDA",
        "row": 0,
        "col": 1,
        "dir": "V"
      }
    ]
  },
  {
    "id": 36,
    "name": "Nivel 36 - Sierra Majestuosa",
    "letters": [
      "S",
      "I",
      "E",
      "R",
      "R",
      "A"
    ],
    "words": [
      {
        "id": 1,
        "word": "SIERRA",
        "row": 1,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "SERIA",
        "row": 1,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "RISA",
        "row": 0,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "REIR",
        "row": 0,
        "col": 2,
        "dir": "V"
      }
    ]
  },
  {
    "id": 37,
    "name": "Nivel 37 - Pino Esbelto",
    "letters": [
      "P",
      "I",
      "N",
      "E",
      "T",
      "A"
    ],
    "words": [
      {
        "id": 1,
        "word": "PINETA",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "PITA",
        "row": 3,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "TINA",
        "row": 2,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "TAPE",
        "row": 0,
        "col": 3,
        "dir": "V"
      }
    ]
  },
  {
    "id": 38,
    "name": "Nivel 38 - Laguna Serena",
    "letters": [
      "L",
      "A",
      "G",
      "U",
      "N",
      "A"
    ],
    "words": [
      {
        "id": 1,
        "word": "LAGUNA",
        "row": 1,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "LUNA",
        "row": 1,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "GANA",
        "row": 0,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "GALA",
        "row": 1,
        "col": 2,
        "dir": "V"
      }
    ]
  },
  {
    "id": 39,
    "name": "Nivel 39 - Cueva Oculta",
    "letters": [
      "C",
      "U",
      "E",
      "V",
      "A",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "CUEVAS",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "CUEVA",
        "row": 3,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "AVES",
        "row": 1,
        "col": 2,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "SECA",
        "row": 0,
        "col": 4,
        "dir": "V"
      }
    ]
  },
  {
    "id": 40,
    "name": "Nivel 40 - Piedra Firme",
    "letters": [
      "P",
      "I",
      "E",
      "D",
      "R",
      "A"
    ],
    "words": [
      {
        "id": 1,
        "word": "PIEDRA",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "PIDE",
        "row": 3,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "IDEA",
        "row": 3,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "ARDE",
        "row": 0,
        "col": 2,
        "dir": "V"
      }
    ]
  },
  {
    "id": 41,
    "name": "Nivel 41 - Colina Suave",
    "letters": [
      "C",
      "O",
      "L",
      "I",
      "N",
      "A"
    ],
    "words": [
      {
        "id": 1,
        "word": "COLINA",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "COLA",
        "row": 3,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "LINO",
        "row": 0,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "LONA",
        "row": 3,
        "col": 2,
        "dir": "V"
      }
    ]
  },
  {
    "id": 42,
    "name": "Nivel 42 - Musgo Húmedo",
    "letters": [
      "M",
      "U",
      "S",
      "G",
      "O",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "MUSGOS",
        "row": 1,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "MUSGO",
        "row": 1,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "SUMO",
        "row": 0,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "USOS",
        "row": 0,
        "col": 2,
        "dir": "V"
      }
    ]
  },
  {
    "id": 43,
    "name": "Nivel 43 - Corteza Antigua",
    "letters": [
      "C",
      "O",
      "R",
      "T",
      "E",
      "Z"
    ],
    "words": [
      {
        "id": 1,
        "word": "CORTEZ",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "CORTE",
        "row": 3,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "RETO",
        "row": 0,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "ROTE",
        "row": 3,
        "col": 2,
        "dir": "V"
      }
    ]
  },
  {
    "id": 44,
    "name": "Nivel 44 - Arbusto Florido",
    "letters": [
      "R",
      "A",
      "M",
      "A",
      "J",
      "E"
    ],
    "words": [
      {
        "id": 1,
        "word": "RAMAJE",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "RAMA",
        "row": 3,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "ARAM",
        "row": 2,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "MERA",
        "row": 0,
        "col": 1,
        "dir": "V"
      }
    ]
  },
  {
    "id": 45,
    "name": "Nivel 45 - Madera Noble",
    "letters": [
      "M",
      "A",
      "D",
      "E",
      "R",
      "A"
    ],
    "words": [
      {
        "id": 1,
        "word": "MADERA",
        "row": 2,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "MADRE",
        "row": 2,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "DAMA",
        "row": 0,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "RAMA",
        "row": 1,
        "col": 1,
        "dir": "V"
      }
    ]
  },
  {
    "id": 46,
    "name": "Nivel 46 - Bosque Encantado",
    "letters": [
      "B",
      "O",
      "S",
      "Q",
      "U",
      "E"
    ],
    "words": [
      {
        "id": 1,
        "word": "BOSQUE",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "QUES",
        "row": 0,
        "col": 2,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "QUBO",
        "row": 1,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "SEBO",
        "row": 0,
        "col": 1,
        "dir": "V"
      }
    ]
  },
  {
    "id": 47,
    "name": "Nivel 47 - Raíz Profunda",
    "letters": [
      "R",
      "A",
      "I",
      "C",
      "E",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "RAICES",
        "row": 2,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "CARI",
        "row": 0,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "RICA",
        "row": 2,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "CIAR",
        "row": 0,
        "col": 1,
        "dir": "V"
      }
    ]
  },
  {
    "id": 48,
    "name": "Nivel 48 - Arroyo Suave",
    "letters": [
      "A",
      "R",
      "R",
      "O",
      "Y",
      "O"
    ],
    "words": [
      {
        "id": 1,
        "word": "ARROYO",
        "row": 1,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "RAYO",
        "row": 0,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "RARO",
        "row": 1,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "ORAR",
        "row": 0,
        "col": 1,
        "dir": "V"
      }
    ]
  },
  {
    "id": 49,
    "name": "Nivel 49 - Llama Ardiente",
    "letters": [
      "L",
      "L",
      "A",
      "M",
      "A",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "LLAMAS",
        "row": 2,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "LLAMA",
        "row": 2,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "MALLA",
        "row": 0,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "MASA",
        "row": 1,
        "col": 2,
        "dir": "V"
      }
    ]
  },
  {
    "id": 50,
    "name": "Nivel 50 - Fuego Vivo",
    "letters": [
      "F",
      "U",
      "E",
      "G",
      "O",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "FUEGOS",
        "row": 1,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "FUEGO",
        "row": 1,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "GUFO",
        "row": 0,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "EGOS",
        "row": 1,
        "col": 2,
        "dir": "V"
      }
    ]
  },
  {
    "id": 51,
    "name": "Nivel 51 - Chispa Alegre",
    "letters": [
      "C",
      "H",
      "I",
      "S",
      "P",
      "A"
    ],
    "words": [
      {
        "id": 1,
        "word": "CHISPA",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "CHIP",
        "row": 3,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "PISA",
        "row": 2,
        "col": 2,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "PAIS",
        "row": 0,
        "col": 3,
        "dir": "V"
      }
    ]
  },
  {
    "id": 52,
    "name": "Nivel 52 - Calor de Chimenea",
    "letters": [
      "H",
      "O",
      "G",
      "A",
      "R"
    ],
    "words": [
      {
        "id": 1,
        "word": "HOGAR",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "HORA",
        "row": 3,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "AGRO",
        "row": 0,
        "col": 1,
        "dir": "V"
      }
    ]
  },
  {
    "id": 53,
    "name": "Nivel 53 - Trueno Retumbante",
    "letters": [
      "T",
      "R",
      "U",
      "E",
      "N",
      "O"
    ],
    "words": [
      {
        "id": 1,
        "word": "TRUENO",
        "row": 1,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "TREN",
        "row": 1,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "NETO",
        "row": 0,
        "col": 3,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "TUNO",
        "row": 0,
        "col": 2,
        "dir": "V"
      }
    ]
  },
  {
    "id": 54,
    "name": "Nivel 54 - Lustre Dorado",
    "letters": [
      "L",
      "U",
      "S",
      "T",
      "R",
      "E"
    ],
    "words": [
      {
        "id": 1,
        "word": "LUSTRE",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "SURTE",
        "row": 2,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "TRES",
        "row": 0,
        "col": 2,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "RUTE",
        "row": 1,
        "col": 3,
        "dir": "V"
      }
    ]
  },
  {
    "id": 55,
    "name": "Nivel 55 - Farola Antigua",
    "letters": [
      "F",
      "A",
      "R",
      "O",
      "L",
      "A"
    ],
    "words": [
      {
        "id": 1,
        "word": "FAROLA",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "FARO",
        "row": 3,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "RALA",
        "row": 2,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "LORA",
        "row": 0,
        "col": 1,
        "dir": "V"
      }
    ]
  },
  {
    "id": 56,
    "name": "Nivel 56 - Bronce Fundido",
    "letters": [
      "B",
      "R",
      "O",
      "N",
      "C",
      "E"
    ],
    "words": [
      {
        "id": 1,
        "word": "BRONCE",
        "row": 2,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "ROCE",
        "row": 2,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "OBRE",
        "row": 1,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "CERO",
        "row": 0,
        "col": 1,
        "dir": "V"
      }
    ]
  },
  {
    "id": 57,
    "name": "Nivel 57 - Prisma Óptico",
    "letters": [
      "P",
      "R",
      "I",
      "S",
      "M",
      "A"
    ],
    "words": [
      {
        "id": 1,
        "word": "PRISMA",
        "row": 2,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "MIRA",
        "row": 0,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "RIMA",
        "row": 1,
        "col": 2,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "PISA",
        "row": 2,
        "col": 0,
        "dir": "V"
      }
    ]
  },
  {
    "id": 58,
    "name": "Nivel 58 - Carta Náutica",
    "letters": [
      "C",
      "A",
      "R",
      "T",
      "A",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "CARTAS",
        "row": 2,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "CARTA",
        "row": 2,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "CARA",
        "row": 1,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "ACTA",
        "row": 0,
        "col": 3,
        "dir": "V"
      }
    ]
  },
  {
    "id": 59,
    "name": "Nivel 59 - Rumbo Fijo",
    "letters": [
      "R",
      "U",
      "M",
      "B",
      "O",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "RUMBOS",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "RUMBO",
        "row": 3,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "MURO",
        "row": 2,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "SOBR",
        "row": 0,
        "col": 0,
        "dir": "V"
      }
    ]
  },
  {
    "id": 60,
    "name": "Nivel 60 - Tesoro Pirata",
    "letters": [
      "T",
      "E",
      "S",
      "O",
      "R",
      "O"
    ],
    "words": [
      {
        "id": 1,
        "word": "TESORO",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "ROTO",
        "row": 1,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "SETO",
        "row": 2,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "ROSE",
        "row": 0,
        "col": 1,
        "dir": "V"
      }
    ]
  },
  {
    "id": 61,
    "name": "Nivel 61 - Cofre Sellado",
    "letters": [
      "C",
      "O",
      "F",
      "R",
      "E",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "COFRES",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "COFRE",
        "row": 3,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "FRES",
        "row": 3,
        "col": 2,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "CERO",
        "row": 0,
        "col": 1,
        "dir": "V"
      }
    ]
  },
  {
    "id": 62,
    "name": "Nivel 62 - Corona Imperial",
    "letters": [
      "C",
      "O",
      "R",
      "O",
      "N",
      "A"
    ],
    "words": [
      {
        "id": 1,
        "word": "CORONA",
        "row": 1,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "CORO",
        "row": 1,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "ROCA",
        "row": 0,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "CONO",
        "row": 0,
        "col": 3,
        "dir": "V"
      }
    ]
  },
  {
    "id": 63,
    "name": "Nivel 63 - Torre Vigía",
    "letters": [
      "T",
      "O",
      "R",
      "R",
      "E",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "TORRES",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "TORRE",
        "row": 3,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "RETO",
        "row": 1,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "SETO",
        "row": 0,
        "col": 1,
        "dir": "V"
      }
    ]
  },
  {
    "id": 64,
    "name": "Nivel 64 - Puerta Tallada",
    "letters": [
      "P",
      "U",
      "E",
      "R",
      "T",
      "A"
    ],
    "words": [
      {
        "id": 1,
        "word": "PUERTA",
        "row": 1,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "PARTE",
        "row": 1,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "PURA",
        "row": 0,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "PERA",
        "row": 0,
        "col": 2,
        "dir": "V"
      }
    ]
  },
  {
    "id": 65,
    "name": "Nivel 65 - Clave Secreta",
    "letters": [
      "C",
      "L",
      "A",
      "V",
      "E",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "CLAVES",
        "row": 1,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "CLAVE",
        "row": 1,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "LAVE",
        "row": 1,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "VALE",
        "row": 0,
        "col": 2,
        "dir": "V"
      }
    ]
  },
  {
    "id": 66,
    "name": "Nivel 66 - Escudo Protector",
    "letters": [
      "E",
      "S",
      "C",
      "U",
      "D",
      "O"
    ],
    "words": [
      {
        "id": 1,
        "word": "ESCUDO",
        "row": 1,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "SECO",
        "row": 0,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "ECOS",
        "row": 1,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "SUDE",
        "row": 1,
        "col": 1,
        "dir": "V"
      }
    ]
  },
  {
    "id": 67,
    "name": "Nivel 67 - Espada Heroica",
    "letters": [
      "E",
      "S",
      "P",
      "A",
      "D",
      "A"
    ],
    "words": [
      {
        "id": 1,
        "word": "ESPADA",
        "row": 2,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "PASA",
        "row": 0,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "SADA",
        "row": 2,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "SAPA",
        "row": 0,
        "col": 2,
        "dir": "V"
      }
    ]
  },
  {
    "id": 68,
    "name": "Nivel 68 - Castillo Fuerte",
    "letters": [
      "A",
      "L",
      "C",
      "A",
      "Z"
    ],
    "words": [
      {
        "id": 1,
        "word": "ALCAZ",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "AZAL",
        "row": 3,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "CALA",
        "row": 0,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "ALCA",
        "row": 2,
        "col": 1,
        "dir": "V"
      }
    ]
  },
  {
    "id": 69,
    "name": "Nivel 69 - Muralla Alta",
    "letters": [
      "M",
      "U",
      "R",
      "O",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "MUROS",
        "row": 1,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "MURO",
        "row": 1,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "SUMO",
        "row": 0,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "RUMO",
        "row": 1,
        "col": 2,
        "dir": "V"
      }
    ]
  },
  {
    "id": 70,
    "name": "Nivel 70 - Palacio Real",
    "letters": [
      "P",
      "A",
      "L",
      "A",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "PALAS",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "PALA",
        "row": 3,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "SALA",
        "row": 2,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "PASA",
        "row": 0,
        "col": 1,
        "dir": "V"
      }
    ]
  },
  {
    "id": 71,
    "name": "Nivel 71 - Estandarte Noble",
    "letters": [
      "P",
      "E",
      "N",
      "D",
      "O",
      "N"
    ],
    "words": [
      {
        "id": 1,
        "word": "PENDON",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "PONE",
        "row": 3,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "NODE",
        "row": 0,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "DENO",
        "row": 2,
        "col": 1,
        "dir": "V"
      }
    ]
  },
  {
    "id": 72,
    "name": "Nivel 72 - Corona de Laurel",
    "letters": [
      "L",
      "A",
      "U",
      "R",
      "E",
      "L"
    ],
    "words": [
      {
        "id": 1,
        "word": "LAUREL",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "REAL",
        "row": 0,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "RULE",
        "row": 2,
        "col": 2,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "LUAR",
        "row": 3,
        "col": 0,
        "dir": "V"
      }
    ]
  },
  {
    "id": 73,
    "name": "Nivel 73 - Cetro Tallado",
    "letters": [
      "C",
      "E",
      "T",
      "R",
      "O",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "CETROS",
        "row": 4,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "CETRO",
        "row": 4,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "CORTE",
        "row": 0,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "RETO",
        "row": 2,
        "col": 2,
        "dir": "V"
      }
    ]
  },
  {
    "id": 74,
    "name": "Nivel 74 - Casco Brillante",
    "letters": [
      "C",
      "A",
      "S",
      "C",
      "O",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "CASCOS",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "CASCO",
        "row": 3,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "COSA",
        "row": 0,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "SACO",
        "row": 2,
        "col": 1,
        "dir": "V"
      }
    ]
  },
  {
    "id": 75,
    "name": "Nivel 75 - Arco y Flecha",
    "letters": [
      "F",
      "L",
      "E",
      "C",
      "H",
      "A"
    ],
    "words": [
      {
        "id": 1,
        "word": "FLECHA",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "ECHA",
        "row": 3,
        "col": 2,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "HACE",
        "row": 0,
        "col": 2,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "CHAL",
        "row": 0,
        "col": 1,
        "dir": "V"
      }
    ]
  },
  {
    "id": 76,
    "name": "Nivel 76 - Lanza Certera",
    "letters": [
      "L",
      "A",
      "N",
      "Z",
      "A",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "LANZAS",
        "row": 2,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "LANZA",
        "row": 2,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "SALA",
        "row": 0,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "ZALA",
        "row": 1,
        "col": 1,
        "dir": "V"
      }
    ]
  },
  {
    "id": 77,
    "name": "Nivel 77 - Yelmo Férreo",
    "letters": [
      "Y",
      "E",
      "L",
      "M",
      "O",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "YELMOS",
        "row": 2,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "YELMO",
        "row": 2,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "YESO",
        "row": 1,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "MELO",
        "row": 0,
        "col": 2,
        "dir": "V"
      }
    ]
  },
  {
    "id": 78,
    "name": "Nivel 78 - Música Celestial",
    "letters": [
      "M",
      "U",
      "S",
      "I",
      "C",
      "A"
    ],
    "words": [
      {
        "id": 1,
        "word": "MUSICA",
        "row": 2,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "CIMA",
        "row": 0,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "SUMA",
        "row": 1,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "MUSA",
        "row": 0,
        "col": 2,
        "dir": "V"
      }
    ]
  },
  {
    "id": 79,
    "name": "Nivel 79 - Ritmo Animado",
    "letters": [
      "R",
      "I",
      "T",
      "M",
      "O",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "RITMOS",
        "row": 2,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "RITMO",
        "row": 2,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "TIRO",
        "row": 1,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "MITO",
        "row": 0,
        "col": 2,
        "dir": "V"
      }
    ]
  },
  {
    "id": 80,
    "name": "Nivel 80 - Canto Dulce",
    "letters": [
      "C",
      "A",
      "N",
      "T",
      "O",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "CANTOS",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "CANTO",
        "row": 3,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "TACO",
        "row": 2,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "SOTA",
        "row": 0,
        "col": 1,
        "dir": "V"
      }
    ]
  },
  {
    "id": 81,
    "name": "Nivel 81 - Poema Escrito",
    "letters": [
      "P",
      "O",
      "E",
      "M",
      "A",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "POEMAS",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "POEMA",
        "row": 3,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "PESO",
        "row": 0,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "MESA",
        "row": 2,
        "col": 2,
        "dir": "V"
      }
    ]
  },
  {
    "id": 82,
    "name": "Nivel 82 - Pintor Inspirado",
    "letters": [
      "P",
      "I",
      "N",
      "T",
      "O",
      "R"
    ],
    "words": [
      {
        "id": 1,
        "word": "PINTOR",
        "row": 1,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "PINTO",
        "row": 1,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "TIRO",
        "row": 0,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "TRIO",
        "row": 1,
        "col": 3,
        "dir": "V"
      }
    ]
  },
  {
    "id": 83,
    "name": "Nivel 83 - Lienzo de Seda",
    "letters": [
      "L",
      "I",
      "E",
      "N",
      "Z",
      "O"
    ],
    "words": [
      {
        "id": 1,
        "word": "LIENZO",
        "row": 1,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "LINO",
        "row": 1,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "LEON",
        "row": 0,
        "col": 2,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "ZELO",
        "row": 1,
        "col": 4,
        "dir": "V"
      }
    ]
  },
  {
    "id": 84,
    "name": "Nivel 84 - Actor en Escena",
    "letters": [
      "A",
      "C",
      "T",
      "O",
      "R",
      "A"
    ],
    "words": [
      {
        "id": 1,
        "word": "ACTORA",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "ACTOR",
        "row": 3,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "CARA",
        "row": 0,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "ROCA",
        "row": 1,
        "col": 1,
        "dir": "V"
      }
    ]
  },
  {
    "id": 85,
    "name": "Nivel 85 - Baile de Gala",
    "letters": [
      "B",
      "A",
      "I",
      "L",
      "E",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "BAILES",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "BAILE",
        "row": 3,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "ISLA",
        "row": 0,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "BALE",
        "row": 1,
        "col": 3,
        "dir": "V"
      }
    ]
  },
  {
    "id": 86,
    "name": "Nivel 86 - Cuerda Afinada",
    "letters": [
      "C",
      "U",
      "E",
      "R",
      "D",
      "A"
    ],
    "words": [
      {
        "id": 1,
        "word": "CUERDA",
        "row": 1,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "RUEDA",
        "row": 0,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "CURE",
        "row": 1,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "CEDA",
        "row": 0,
        "col": 2,
        "dir": "V"
      }
    ]
  },
  {
    "id": 87,
    "name": "Nivel 87 - Flauta de Bambú",
    "letters": [
      "F",
      "L",
      "A",
      "U",
      "T",
      "A"
    ],
    "words": [
      {
        "id": 1,
        "word": "FLAUTA",
        "row": 2,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "LATA",
        "row": 2,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "ALFA",
        "row": 0,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "TALA",
        "row": 0,
        "col": 1,
        "dir": "V"
      }
    ]
  },
  {
    "id": 88,
    "name": "Nivel 88 - Tambor Alegre",
    "letters": [
      "T",
      "A",
      "M",
      "B",
      "O",
      "R"
    ],
    "words": [
      {
        "id": 1,
        "word": "TAMBOR",
        "row": 2,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "RAMO",
        "row": 1,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "ROMA",
        "row": 0,
        "col": 2,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "BATO",
        "row": 0,
        "col": 0,
        "dir": "V"
      }
    ]
  },
  {
    "id": 89,
    "name": "Nivel 89 - Violín Sonoro",
    "letters": [
      "V",
      "I",
      "O",
      "L",
      "I",
      "N"
    ],
    "words": [
      {
        "id": 1,
        "word": "VIOLIN",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "VINO",
        "row": 3,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "LINO",
        "row": 2,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "VILO",
        "row": 0,
        "col": 2,
        "dir": "V"
      }
    ]
  },
  {
    "id": 90,
    "name": "Nivel 90 - Acorde Mayor",
    "letters": [
      "A",
      "C",
      "O",
      "R",
      "D",
      "E"
    ],
    "words": [
      {
        "id": 1,
        "word": "ACORDE",
        "row": 4,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "CORDA",
        "row": 0,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "ROCA",
        "row": 2,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "CEDA",
        "row": 2,
        "col": 4,
        "dir": "V"
      }
    ]
  },
  {
    "id": 91,
    "name": "Nivel 91 - Verso Ritmado",
    "letters": [
      "V",
      "E",
      "R",
      "S",
      "O",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "VERSOS",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "VERSO",
        "row": 3,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "ROSE",
        "row": 0,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "RESO",
        "row": 3,
        "col": 2,
        "dir": "V"
      }
    ]
  },
  {
    "id": 92,
    "name": "Nivel 92 - Soneto Romántico",
    "letters": [
      "S",
      "O",
      "N",
      "E",
      "T",
      "O"
    ],
    "words": [
      {
        "id": 1,
        "word": "SONETO",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "NETO",
        "row": 0,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "SETO",
        "row": 3,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "TONO",
        "row": 2,
        "col": 1,
        "dir": "V"
      }
    ]
  },
  {
    "id": 93,
    "name": "Nivel 93 - Sabio Iluminado",
    "letters": [
      "S",
      "A",
      "B",
      "I",
      "O",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "SABIOS",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "SABIO",
        "row": 3,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "BASO",
        "row": 2,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "SOBA",
        "row": 0,
        "col": 1,
        "dir": "V"
      }
    ]
  },
  {
    "id": 94,
    "name": "Nivel 94 - Razón Despierta",
    "letters": [
      "R",
      "A",
      "Z",
      "O",
      "N",
      "A"
    ],
    "words": [
      {
        "id": 1,
        "word": "RAZONA",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "RAZON",
        "row": 3,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "ZONA",
        "row": 0,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "RANA",
        "row": 1,
        "col": 4,
        "dir": "V"
      }
    ]
  },
  {
    "id": 95,
    "name": "Nivel 95 - Mente Clara",
    "letters": [
      "M",
      "E",
      "N",
      "T",
      "E",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "MENTES",
        "row": 1,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "MENTE",
        "row": 1,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "METE",
        "row": 0,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "NETE",
        "row": 1,
        "col": 2,
        "dir": "V"
      }
    ]
  },
  {
    "id": 96,
    "name": "Nivel 96 - Sueño Dorado",
    "letters": [
      "S",
      "U",
      "E",
      "Ñ",
      "O",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "SUEÑOS",
        "row": 1,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "SUEÑO",
        "row": 1,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "SEÑO",
        "row": 0,
        "col": 2,
        "dir": "V"
      }
    ]
  },
  {
    "id": 97,
    "name": "Nivel 97 - Verdad Serena",
    "letters": [
      "V",
      "E",
      "R",
      "D",
      "A",
      "D"
    ],
    "words": [
      {
        "id": 1,
        "word": "VERDAD",
        "row": 2,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "VEDA",
        "row": 2,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "VERA",
        "row": 1,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "RAVE",
        "row": 0,
        "col": 0,
        "dir": "V"
      }
    ]
  },
  {
    "id": 98,
    "name": "Nivel 98 - Memoria Viva",
    "letters": [
      "M",
      "E",
      "M",
      "O",
      "R",
      "A"
    ],
    "words": [
      {
        "id": 1,
        "word": "MEMORA",
        "row": 2,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "MORA",
        "row": 2,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "RAMO",
        "row": 0,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "ROMA",
        "row": 0,
        "col": 2,
        "dir": "V"
      }
    ]
  },
  {
    "id": 99,
    "name": "Nivel 99 - Palabra Precisa",
    "letters": [
      "V",
      "E",
      "R",
      "B",
      "O",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "VERBOS",
        "row": 4,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "VERBO",
        "row": 4,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "SOBRE",
        "row": 0,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "OBRE",
        "row": 1,
        "col": 1,
        "dir": "V"
      }
    ]
  },
  {
    "id": 100,
    "name": "Nivel 100 - Libro Iluminado",
    "letters": [
      "L",
      "I",
      "B",
      "R",
      "O",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "LIBROS",
        "row": 2,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "LIBRO",
        "row": 2,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "BRIO",
        "row": 0,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "RILO",
        "row": 2,
        "col": 3,
        "dir": "V"
      }
    ]
  },
  {
    "id": 101,
    "name": "Nivel 101 - Pluma Fina",
    "letters": [
      "P",
      "L",
      "U",
      "M",
      "A",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "PLUMAS",
        "row": 2,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "PLUMA",
        "row": 2,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "MULA",
        "row": 0,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "PUMA",
        "row": 1,
        "col": 2,
        "dir": "V"
      }
    ]
  },
  {
    "id": 102,
    "name": "Nivel 102 - Tiempo Infinito",
    "letters": [
      "T",
      "I",
      "E",
      "M",
      "P",
      "O"
    ],
    "words": [
      {
        "id": 1,
        "word": "TIEMPO",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "PITO",
        "row": 1,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "TIPO",
        "row": 2,
        "col": 1,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "MOTE",
        "row": 0,
        "col": 2,
        "dir": "V"
      }
    ]
  },
  {
    "id": 103,
    "name": "Nivel 103 - Amor Verdadero",
    "letters": [
      "A",
      "M",
      "O",
      "R",
      "E",
      "S"
    ],
    "words": [
      {
        "id": 1,
        "word": "AMORES",
        "row": 3,
        "col": 0,
        "dir": "H"
      },
      {
        "id": 2,
        "word": "AMOR",
        "row": 3,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 3,
        "word": "ROMA",
        "row": 0,
        "col": 0,
        "dir": "V"
      },
      {
        "id": 4,
        "word": "RAMO",
        "row": 1,
        "col": 1,
        "dir": "V"
      }
    ]
  }
];

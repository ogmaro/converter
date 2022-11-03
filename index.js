const csv = require("csvtojson");
const fs = require("fs");
const fsp = fs.promises;
const { parse } = require("csv-parse");
const { stringify } = require("csv-stringify");
const { createHash } = require("crypto");

const filename = 'NFT Naming csv - Team Bevel'
const writableStream = fs.createWriteStream(`./csv/${filename}.output.csv`);

const hash =[];

const convert = async () => {
  const jsonArray = await csv().fromFile(`${filename}.csv`); 
  return jsonArray;
};

const caller = async () => {
  const data = await convert();
  data.forEach(async(e) => {
    let json = {
      format: "CHIP-0007",
      $id: e.UUID,
      name: e.Filename,
      description: e.Description,
      minting_tool: filename,
      sensitive_content: false,
      series_number: Number(e["Series Number"]),
      series_total: 526,
      attributes: [
        {
          trait_type: "Gender",
          value: e.Gender,
        },
      ],
      collection: {
        name: "Zuri NFT Tickets for Free Lunch",
        id: "b774f676-c1d5-422e-beed-00ef5510c64d",
        attributes: [
          {
            type: "description",
            value: "Rewards for accomplishments during HNGi9.",
          },
        ],
      },
    };
    await fsp.writeFile(`./json/${json.name}.json`, JSON.stringify(json));
    let readFile = await fsp.readFile(`./json/${json.name}.json`);

    const hashed = createHash("sha256").update(readFile).digest("hex");
    hash.push(hashed);
  });
  writeCSV(); 
  function writeCSV() {
    // This defines the columns of the new csv file
    const columns = [
      "Series Number",
      "Filename",
      "Description",
      "Gender",
      "UUID",
      "Hash",
    ];
  
    // This writes the columns of the new csv file
    const csv_writer = stringify({ header: true, columns: columns });
  
    // This writes the data of the new csv file
    for (let i = 0; i < data.length; i++) {
      data[i][data[i].length - 1] = hash[i]; 
      
      csv_writer.write(data[i]);
    }
  
    
    csv_writer.pipe(writableStream); 
  
    console.log("Finished writing data"); // This logs that the data has been written to the new csv file
  }
}


caller();

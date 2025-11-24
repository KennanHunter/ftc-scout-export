"use client";

import { useState } from "react";

// opr { totalPoints, totalPointsNp, autoPoints, dcArtifactPoints, dcPatternPoints, dcDepotPoints, dcBasePoints }
type TepRecord = {
  noFilterRank: number;
  data: {
    teamNumber: number;
    stats: {
      opr: {
        totalPoints: number;
        totalPointsNp: number;
        autoPoints: number;
        // teleop
        dcPoints: number;
        // teleop components
        dcArtifactPoints: number;
        dcPatternPoints: number;
        dcDepotPoints: number;
        // endgame
        dcBasePoints: number;
      };
    };
  };
};

type TepRecordsResponse = {
  data: {
    tepRecords: {
      data: TepRecord[];
    };
  };
};

const buildCSV = async (totalTeams: number) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const queries_arr = [];

  let skip = 0;
  const take = 50;

  while (skip + take < totalTeams) {
    const graphql = JSON.stringify({
      query: `{\r\n  tepRecords(season:2025, skip:${skip}, take:${take}, region:All, ) {\r\n    data {\r\n      noFilterRank\r\n      data {\r\n        teamNumber\r\n        stats { \r\n            ... on TeamEventStats2025 {\r\n            opr { totalPoints, totalPointsNp, autoPoints, dcPoints, dcArtifactPoints, dcPatternPoints, dcDepotPoints, dcBasePoints }}\r\n        }\r\n      }\r\n    }\r\n  }\r\n}\r\n`,
      variables: {},
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: graphql,
    };

    queries_arr.push(
      fetch("https://api.ftcscout.org/graphql", requestOptions)
        .then((response) => response.text())
        .then((result) => {
          let obj: TepRecordsResponse = JSON.parse(result);

          let { data } = obj.data.tepRecords;

          console.dir({ data });

          return data.map(
            ({
              data: {
                teamNumber,
                stats: { opr },
              },
            }) =>
              `${teamNumber ?? ""}, \
${opr?.totalPoints?.toFixed(2) ?? ""}, \
${opr?.totalPointsNp?.toFixed(2) ?? ""}, \
${opr?.autoPoints?.toFixed(2) ?? ""}, \
${opr?.dcPoints?.toFixed(2) ?? ""}, \
${(opr?.dcPoints - opr?.dcBasePoints)?.toFixed(2) ?? ""}, \
${opr?.dcArtifactPoints?.toFixed(2) ?? ""}, \
${opr?.dcPatternPoints?.toFixed(2) ?? ""}, \
${opr?.dcDepotPoints?.toFixed(2) ?? ""}, \
${opr?.dcBasePoints?.toFixed(2) ?? ""}`
          );
        })
    );

    skip += take;
  }

  const data = await Promise.all(queries_arr);
  let csv =
    "teamnumber, opr, nopr, auto, teleopCombined, teleop (teleopCombined - dcBasePoints), dcArtifactPoints, dcPatternPoints, dcDepotPoints, endgame (dcBasePoints) \n" +
    data.flat().join("\n");

  downloadBlob(new Blob([csv], { type: "text/csv" }));
};

const downloadBlob = (fileBlob: Blob) => {
  const element = document.createElement("a");

  element.href = URL.createObjectURL(fileBlob);

  let now = new Date();

  element.download = `ftc-export-${now.getFullYear()}-${now.getMonth()}-${now.getDate()}@${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.csv`;

  document.body.appendChild(element); // Required for this to work on FireFox

  element.click();

  element.remove();
};

export default function Home() {
  const [totalTeams, setTotalTeams] = useState(6000);
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await buildCSV(totalTeams);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid items-center justify-items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            FTC Scout Export
          </h1>
          <p className="text-gray-600 text-sm">Download team rankings data</p>
        </div>

        <div className="mb-6">
          <label
            htmlFor="totalTeams"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Total Number of Teams
          </label>
          <input
            id="totalTeams"
            type="number"
            value={totalTeams}
            onChange={(e) => setTotalTeams(Number(e.target.value))}
            disabled={isLoading}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            min="1"
            max="10000"
          />
        </div>

        <button
          onClick={handleDownload}
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100"
        >
          {isLoading ? "Downloading..." : "Download Full Rankings"}
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Programmed by{" "}
            <a
              href="https://github.com/kennanhunter"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-700 hover:underline font-medium"
            >
              Kennan Hunter
            </a>{" "}
            for{" "}
            <a
              href="https://funroboticsnetwork.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-700 hover:underline font-medium"
            >
              FUN Robotics Network
            </a>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            <a
              href="https://github.com/KennanHunter/ftc-scout-export"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-700 hover:underline font-medium"
            >
              View on GitHub
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}

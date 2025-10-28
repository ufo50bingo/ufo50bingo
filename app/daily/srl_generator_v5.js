export default function srl_generator_v5(bingoList, opts) {
  var LANG = opts.lang || "name";
  var MODE = opts.mode || "normal";
  var SEED = opts.seed || Math.ceil(999999 * Math.random()).toString();
  var size = 5;

  // The original SRL generators were written with 1-indexed difficuty tiers.
  // If we get a goal list that is 0-indexed, hack it to be 1-indexed instead.
  if (bingoList.length === 25) {
    var originalBingoList = bingoList;
    bingoList = [undefined].concat(originalBingoList); // filler value for index 0
  }

  if (true) {
    var lineCheckList = [];
    if (size == 5) {
      lineCheckList[1] = [1, 2, 3, 4, 5, 10, 15, 20, 6, 12, 18, 24];
      lineCheckList[2] = [0, 2, 3, 4, 6, 11, 16, 21];
      lineCheckList[3] = [0, 1, 3, 4, 7, 12, 17, 22];
      lineCheckList[4] = [0, 1, 2, 4, 8, 13, 18, 23];
      lineCheckList[5] = [0, 1, 2, 3, 8, 12, 16, 20, 9, 14, 19, 24];
      lineCheckList[6] = [0, 10, 15, 20, 6, 7, 8, 9];
      lineCheckList[7] = [0, 12, 18, 24, 5, 7, 8, 9, 1, 11, 16, 21];
      lineCheckList[8] = [5, 6, 8, 9, 2, 12, 17, 22];
      lineCheckList[9] = [4, 12, 16, 20, 9, 7, 6, 5, 3, 13, 18, 23];
      lineCheckList[10] = [4, 14, 19, 24, 8, 7, 6, 5];
      lineCheckList[11] = [0, 5, 15, 20, 11, 12, 13, 14];
      lineCheckList[12] = [1, 6, 16, 21, 10, 12, 13, 14];
      lineCheckList[13] = [
        0, 6, 12, 18, 24, 20, 16, 8, 4, 2, 7, 17, 22, 10, 11, 13, 14,
      ];
      lineCheckList[14] = [3, 8, 18, 23, 10, 11, 12, 14];
      lineCheckList[15] = [4, 9, 19, 24, 10, 11, 12, 13];
      lineCheckList[16] = [0, 5, 10, 20, 16, 17, 18, 19];
      lineCheckList[17] = [15, 17, 18, 19, 1, 6, 11, 21, 20, 12, 8, 4];
      lineCheckList[18] = [15, 16, 18, 19, 2, 7, 12, 22];
      lineCheckList[19] = [15, 16, 17, 19, 23, 13, 8, 3, 24, 12, 6, 0];
      lineCheckList[20] = [4, 9, 14, 24, 15, 16, 17, 18];
      lineCheckList[21] = [0, 5, 10, 15, 16, 12, 8, 4, 21, 22, 23, 24];
      lineCheckList[22] = [20, 22, 23, 24, 1, 6, 11, 16];
      lineCheckList[23] = [2, 7, 12, 17, 20, 21, 23, 24];
      lineCheckList[24] = [20, 21, 22, 24, 3, 8, 13, 18];
      lineCheckList[25] = [0, 6, 12, 18, 20, 21, 22, 23, 19, 14, 9, 4];
    }

    function difficulty(i) {
      var Num3 = SEED % 1000;
      var Rem8 = Num3 % 8;
      var Rem4 = Math.floor(Rem8 / 2);
      var Rem2 = Rem8 % 2;
      var Rem5 = Num3 % 5;
      var Rem3 = Num3 % 3;
      var RemT = Math.floor(Num3 / 120);
      var Table5 = [0];
      Table5.splice(Rem2, 0, 1);
      Table5.splice(Rem3, 0, 2);
      Table5.splice(Rem4, 0, 3);
      Table5.splice(Rem5, 0, 4);
      Num3 = Math.floor(SEED / 1000);
      Num3 = Num3 % 1000;
      Rem8 = Num3 % 8;
      Rem4 = Math.floor(Rem8 / 2);
      Rem2 = Rem8 % 2;
      Rem5 = Num3 % 5;
      Rem3 = Num3 % 3;
      RemT = RemT * 8 + Math.floor(Num3 / 120);
      var Table1 = [0];
      Table1.splice(Rem2, 0, 1);
      Table1.splice(Rem3, 0, 2);
      Table1.splice(Rem4, 0, 3);
      Table1.splice(Rem5, 0, 4);
      i--;
      RemT = RemT % 5;
      const x = (i + RemT) % 5;
      const y = Math.floor(i / 5);
      var e5 = Table5[(x + 3 * y) % 5];
      var e1 = Table1[(3 * x + y) % 5];
      let value = 5 * e5 + e1;
      if (MODE == "short") {
        value = Math.floor(value / 2);
      } else if (MODE == "long") {
        value = Math.floor((value + 25) / 2);
      }
      value++;
      return value;
    }

    function checkLine(i, typesA) {
      var synergy = 0;
      for (var j = 0; j < lineCheckList[i].length; j++) {
        var typesB = bingoBoard[lineCheckList[i][j] + 1].types;
        if (typeof typesA != "undefined" && typeof typesB != "undefined") {
          for (var k = 0; k < typesA.length; k++) {
            for (var l = 0; l < typesB.length; l++) {
              if (typesA[k] == typesB[l]) {
                synergy++;
                if (k == 0) {
                  synergy++;
                }
                if (l == 0) {
                  synergy++;
                }
              }
            }
          }
        }
      }
      return synergy;
    }
    var bingoBoard = [];
    for (var i = 1; i <= 25; i++) {
      bingoBoard[i] = {
        difficulty: difficulty(i),
      };
    }
    for (var i = 1; i <= 25; i++) {
      var getDifficulty = bingoBoard[i].difficulty;
      var RNG = Math.floor(bingoList[getDifficulty].length * Math.random());
      if (RNG == bingoList[getDifficulty].length) {
        RNG--;
      }
      var j = 0,
        synergy = 0,
        currentObj = null,
        minSynObj = null;
      do {
        currentObj =
          bingoList[getDifficulty][(j + RNG) % bingoList[getDifficulty].length];
        synergy = checkLine(i, currentObj.types);
        if (minSynObj == null || synergy < minSynObj.synergy) {
          minSynObj = {
            synergy: synergy,
            value: currentObj,
          };
        }
        j++;
      } while (synergy != 0 && j < bingoList[getDifficulty].length);
      bingoBoard[i].types = minSynObj.value.types;
      bingoBoard[i].name = minSynObj.value[LANG] || minSynObj.value.name;
      bingoBoard[i].synergy = minSynObj.synergy;
    }
    return bingoBoard;
  }
}

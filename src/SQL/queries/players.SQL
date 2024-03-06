DELETE FROM players;

INSERT INTO players (
    steamAccountId, 
    matchesCount, 
    matchesWin, 
    POSITION_1_matchesCount, 
    POSITION_1_matchesWin,
    POSITION_2_matchesCount,
    POSITION_2_matchesWin, 
    POSITION_3_matchesCount, 
    POSITION_3_matchesWin, 
    POSITION_4_matchesCount, 
    POSITION_4_matchesWin, 
    POSITION_5_matchesCount, 
    POSITION_5_matchesWin, 
    SAFE_LANE_matchesCount, 
    SAFE_LANE_matchesWin, 
    MID_LANE_matchesCount, 
    MID_LANE_matchesWin, 
    OFF_LANE_matchesCount, 
    OFF_LANE_matchesWin, 
    radiant_matchescount, 
    radiant_matcheswin, 
    dire_matchescount, 
    dire_matcheswin, 
    nickname
) 
SELECT 
    mp.steamAccountId,
    count(*) as matchesCount,
    count(CASE WHEN mp.isVictory THEN 1 END) as matchesWin,
    count(CASE WHEN mp.position = 'POSITION_1' THEN 1 END) as POSITION_1_matchesCount,
    count(CASE WHEN mp.position = 'POSITION_1' AND mp.isVictory THEN 1 END) as POSITION_1_matchesWin,
    count(CASE WHEN mp.position = 'POSITION_2' THEN 1 END) as POSITION_2_matchesCount,
    count(CASE WHEN mp.position = 'POSITION_2' AND mp.isVictory THEN 1 END) as POSITION_2_matchesWin,
    count(CASE WHEN mp.position = 'POSITION_3' THEN 1 END) as POSITION_3_matchesCount,
    count(CASE WHEN mp.position = 'POSITION_3' AND mp.isVictory THEN 1 END) as POSITION_3_matchesWin,
    count(CASE WHEN mp.position = 'POSITION_4' THEN 1 END) as POSITION_4_matchesCount,
    count(CASE WHEN mp.position = 'POSITION_4' AND mp.isVictory THEN 1 END) as POSITION_4_matchesWin,
    count(CASE WHEN mp.position = 'POSITION_5' THEN 1 END) as POSITION_5_matchesCount,
    count(CASE WHEN mp.position = 'POSITION_5' AND mp.isVictory THEN 1 END) as POSITION_5_matchesWin,
    count(CASE WHEN mp.lane = 'SAFE_LANE' THEN 1 END) as SAFE_LANE_matchesCount,
    count(CASE WHEN mp.lane = 'SAFE_LANE' AND mp.isVictory THEN 1 END) as SAFE_LANE_matchesWin,
    count(CASE WHEN mp.lane = 'MID_LANE' THEN 1 END) as MID_LANE_matchesCount,
    count(CASE WHEN mp.lane = 'MID_LANE' AND mp.isVictory THEN 1 END) as MID_LANE_matchesWin,
    count(CASE WHEN mp.lane = 'OFF_LANE' THEN 1 END) as OFF_LANE_matchesCount,
    count(CASE WHEN mp.lane = 'OFF_LANE' AND mp.isVictory THEN 1 END) as OFF_LANE_matchesWin,
    count(CASE WHEN mp.isRadiant='true' THEN 1 END) as radiant_matchescount,
    count(CASE WHEN mp.isRadiant='true' AND mp.isVictory='true' THEN 1 END) as radiant_matcheswin,
    count(CASE WHEN mp.isRadiant='false' THEN 1 END) as dire_matchescount,
    count(CASE WHEN mp.isRadiant='false' AND mp.isVictory='true' THEN 1 END) as dire_matcheswin,
    MODE() WITHIN GROUP (ORDER BY mp.nickname) AS nickname
FROM 
    matchesPlayers mp
LEFT JOIN 
    players p ON mp.steamAccountId = p.steamAccountId
WHERE 
    NOT EXISTS (SELECT 1 FROM players WHERE players.steamAccountId = mp.steamAccountId)
GROUP BY 
    mp.steamAccountId;


UPDATE players
SET firstbloodtime_avg = (
  SELECT AVG(matchesplayers.firstbloodtime)
  FROM matchesplayers
  WHERE (
    players.steamaccountid = matchesplayers.steamaccountid
  )
);
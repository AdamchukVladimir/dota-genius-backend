WITH aggregated_data AS (
  SELECT
    mp.steamAccountId,
    mp.position,
    mp.lane,
    mp.isVictory,
    mp.isRadiant
  FROM matchesPlayers mp
  LEFT JOIN players p ON mp.steamAccountId = p.steamAccountId
  WHERE p.steamAccountId IS NULL
), updated_players AS (
  INSERT INTO players (steamAccountId, matchesCount, matchesWin, POSITION_1_matchesCount, POSITION_1_matchesWin,
                      POSITION_2_matchesCount, POSITION_2_matchesWin, POSITION_3_matchesCount, POSITION_3_matchesWin,
                      POSITION_4_matchesCount, POSITION_4_matchesWin, POSITION_5_matchesCount, POSITION_5_matchesWin,
                      SAFE_LANE_matchesCount, SAFE_LANE_matchesWin, MID_LANE_matchesCount, MID_LANE_matchesWin,
                      OFF_LANE_matchesCount, OFF_LANE_matchesWin, radiant_matchescount, radiant_matcheswin,
                      dire_matchescount, dire_matcheswin)
  SELECT
    a.steamAccountId,
    count(*) as matchesCount,
    count(CASE WHEN a.isVictory THEN 1 END) as matchesWin,
    count(CASE WHEN a.position = 'POSITION_1' THEN 1 END) as POSITION_1_matchesCount,
    count(CASE WHEN a.position = 'POSITION_1' AND a.isVictory THEN 1 END) as POSITION_1_matchesWin,
    count(CASE WHEN a.position = 'POSITION_2' THEN 1 END) as POSITION_2_matchesCount,
    count(CASE WHEN a.position = 'POSITION_2' AND a.isVictory THEN 1 END) as POSITION_2_matchesWin,
    count(CASE WHEN a.position = 'POSITION_3' THEN 1 END) as POSITION_3_matchesCount,
    count(CASE WHEN a.position = 'POSITION_3' AND a.isVictory THEN 1 END) as POSITION_3_matchesWin,
    count(CASE WHEN a.position = 'POSITION_4' THEN 1 END) as POSITION_4_matchesCount,
    count(CASE WHEN a.position = 'POSITION_4' AND a.isVictory THEN 1 END) as POSITION_4_matchesWin,
    count(CASE WHEN a.position = 'POSITION_5' THEN 1 END) as POSITION_5_matchesCount,
    count(CASE WHEN a.position = 'POSITION_5' AND a.isVictory THEN 1 END) as POSITION_5_matchesWin,
    count(CASE WHEN a.lane = 'SAFE_LANE' THEN 1 END) as SAFE_LANE_matchesCount,
    count(CASE WHEN a.lane = 'SAFE_LANE' AND a.isVictory THEN 1 END) as SAFE_LANE_matchesWin,
    count(CASE WHEN a.lane = 'MID_LANE' THEN 1 END) as MID_LANE_matchesCount,
    count(CASE WHEN a.lane = 'MID_LANE' AND a.isVictory THEN 1 END) as MID_LANE_matchesWin,
    count(CASE WHEN a.lane = 'OFF_LANE' THEN 1 END) as OFF_LANE_matchesCount,
    count(CASE WHEN a.lane = 'OFF_LANE' AND a.isVictory THEN 1 END) as OFF_LANE_matchesWin,
    count(CASE WHEN a.isRadiant='true' THEN 1 END) as radiant_matchescount,
    count(CASE WHEN a.isRadiant='true' AND a.isVictory='true' THEN 1 END) as radiant_matcheswin,
    count(CASE WHEN a.isRadiant='false' THEN 1 END) as dire_matchescount,
    count(CASE WHEN a.isRadiant='false' AND a.isVictory='true' THEN 1 END) as dire_matcheswin
  FROM aggregated_data a
  GROUP BY a.steamAccountId
  RETURNING *
)
UPDATE players p
SET matchesCount = p.matchesCount + e.matchesCount,
    matchesWin = p.matchesWin + e.matchesWin,
    POSITION_1_matchesCount = p.POSITION_1_matchesCount + e.POSITION_1_matchesCount,
    POSITION_1_matchesWin = p.POSITION_1_matchesWin + e.POSITION_1_matchesWin,
    POSITION_2_matchesCount = p.POSITION_2_matchesCount + e.POSITION_2_matchesCount,
    POSITION_2_matchesWin = p.POSITION_2_matchesWin + e.POSITION_2_matchesWin,
    POSITION_3_matchesCount = p.POSITION_3_matchesCount + e.POSITION_3_matchesCount,
    POSITION_3_matchesWin = p.POSITION_3_matchesWin + e.POSITION_3_matchesWin,
    POSITION_4_matchesCount = p.POSITION_4_matchesCount + e.POSITION_4_matchesCount,
    POSITION_4_matchesWin = p.POSITION_4_matchesWin + e.POSITION_4_matchesWin,
	POSITION_5_matchesCount = p.POSITION_5_matchesCount + e.POSITION_5_matchesCount,
    POSITION_5_matchesWin = p.POSITION_5_matchesWin + e.POSITION_5_matchesWin,
    SAFE_LANE_matchesCount = p.SAFE_LANE_matchesCount + e.SAFE_LANE_matchesCount,
    SAFE_LANE_matchesWin = p.SAFE_LANE_matchesWin + e.SAFE_LANE_matchesWin,
    MID_LANE_matchesCount = p.MID_LANE_matchesCount + e.MID_LANE_matchesCount,
    MID_LANE_matchesWin = p.MID_LANE_matchesWin + e.MID_LANE_matchesWin,
    OFF_LANE_matchesCount = p.OFF_LANE_matchesCount + e.OFF_LANE_matchesCount,
    OFF_LANE_matchesWin = p.OFF_LANE_matchesWin + e.OFF_LANE_matchesWin,
    radiant_matchescount = p.radiant_matchescount + e.radiant_matchescount,
    radiant_matcheswin = p.radiant_matcheswin + e.radiant_matcheswin,
    dire_matchescount = p.dire_matchescount + e.dire_matchescount,
    dire_matcheswin = p.dire_matcheswin + e.dire_matcheswin
FROM updated_players e
WHERE p.steamAccountId = e.steamAccountId
RETURNING p.*;


UPDATE players
SET nickname = matchesplayers.nickname
FROM matchesplayers
WHERE players.steamaccountid = matchesplayers.steamaccountid
  AND (players.nickname IS NULL OR players.nickname = '');
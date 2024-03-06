DELETE from teams;

INSERT INTO teams (teamid)
SELECT teamid FROM (
  SELECT radiantteamid AS teamid FROM matches
  UNION
  SELECT direteamid AS teamid FROM matches
) AS temp;



UPDATE teams
SET teamname = 
  CASE 
    WHEN teams.teamid = matches.radiantTeamId THEN matches.radiantTeamName
    WHEN teams.teamid = matches.direTeamId THEN matches.direTeamName
    ELSE teams.teamname
  END
FROM matches
WHERE teams.teamid = matches.radiantTeamId OR teams.teamid = matches.direTeamId;

UPDATE teams
SET matchesCount = 0,
    matchesWin = 0,
    radiantMatchesCount = 0,
    direMatchesCount = 0,
    radiantMatchesWin = 0,
    direMatchesWin = 0,
    firstbloodtime_avg = 0;

DO $$  
DECLARE 
    match_record RECORD;
BEGIN

    FOR match_record IN SELECT radiantTeamId, direTeamId, didRadiantWin FROM matches LOOP

        UPDATE teams
        SET matchesCount = COALESCE(matchesCount, 0) + 1,
            radiantMatchesCount = COALESCE(radiantMatchesCount, 0) + CASE WHEN teams.teamid = match_record.radiantTeamId THEN 1 ELSE 0 END,
            direMatchesCount = COALESCE(direMatchesCount, 0) + CASE WHEN teams.teamid = match_record.direTeamId THEN 1 ELSE 0 END
        WHERE teams.teamid = match_record.radiantTeamId OR teams.teamid = match_record.direTeamId;

        UPDATE teams
        SET matchesWin = COALESCE(matchesWin, 0) + 1,
            radiantMatchesWin = COALESCE(radiantMatchesWin, 0) + 1
        WHERE teams.teamid = match_record.radiantTeamId AND match_record.didRadiantWin = true;

        UPDATE teams
        SET matchesWin = COALESCE(matchesWin, 0) + 1,
            direMatchesWin = COALESCE(direMatchesWin, 0) + 1
        WHERE teams.teamid = match_record.direTeamId AND match_record.didRadiantWin = false;
    END LOOP;
END $$;

UPDATE teams
SET firstbloodtime_avg = (
  SELECT AVG(matches.firstbloodtime)
  FROM matches
  WHERE (
    teams.teamid = matches.radiantteamid
  OR 
    teams.teamid = matches.direteamid
  )
);
delete from teams_vs_teams;
INSERT INTO teams_vs_teams (team1id, team1name, team2id, team2name)
SELECT
  t1.teamid AS team1id, t1.teamname AS team1name, 
  t2.teamid AS team2id, t2.teamname AS team2name
FROM
  teams t1
  CROSS JOIN teams t2
WHERE
  (t1.teamid <> t2.teamid) and (t1.teamid > 0) and (t2.teamid > 0) and (t1.matchescount > 20) and (t2.matchescount > 20);
  
UPDATE teams_vs_teams
SET
	matchescount = (SELECT COUNT(*) FROM matches WHERE
    (teams_vs_teams.team1id = matches.radiantteamid and teams_vs_teams.team2id = matches.direteamid)
    OR
    (teams_vs_teams.team2id = matches.radiantteamid and teams_vs_teams.team1id = matches.direteamid)),
	
	matcheswin = (SELECT COUNT(*) FROM matches WHERE
    (teams_vs_teams.team1id = matches.radiantteamid and teams_vs_teams.team2id = matches.direteamid and matches.didradiantwin = 'true')
    OR
    (teams_vs_teams.team2id = matches.radiantteamid and teams_vs_teams.team1id = matches.direteamid and matches.didradiantwin = 'false')),
	
	radiantmatchescount = (SELECT COUNT(*) FROM matches WHERE
    (teams_vs_teams.team1id = matches.radiantteamid and teams_vs_teams.team2id = matches.direteamid)),
	
	radiantmatcheswin = (SELECT COUNT(*) FROM matches WHERE
    (teams_vs_teams.team1id = matches.radiantteamid and teams_vs_teams.team2id = matches.direteamid and matches.didradiantwin = 'true')),
	
	dirematchescount = (SELECT COUNT(*) FROM matches WHERE
	(teams_vs_teams.team2id = matches.radiantteamid and teams_vs_teams.team1id = matches.direteamid)),
	
	dirematcheswin = (SELECT COUNT(*) FROM matches WHERE
	(teams_vs_teams.team2id = matches.radiantteamid and teams_vs_teams.team1id = matches.direteamid and matches.didradiantwin = 'false'));
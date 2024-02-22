delete from teamHeroesVersus;

CREATE TEMPORARY TABLE tempHeroesVersus (id INT);
INSERT INTO tempHeroesVersus VALUES
  (110),(111),(112),(113),(114),(119),(120),(121),(123),(126),(128),(129),(135),(136),(137),(138),
  (1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12),(13),(14),(15),(16),(17),(18),(19),(20),(21),(22),
  (23),(25),(26),(27),(28),(29),(30),(31),(32),(33),(34),(35),(36),(37),(38),(39),(40),(41),(42),(43),
  (44),(45),(46),(47),(48),(49),(50),(51),(52),(53),(54),(55),(56),(57),(58),(59),(60),(61),(62),(63),
  (64),(65),(66),(67),(68),(69),(70),(71),(72),(73),(74),(75),(76),(77),(78),(79),(80),(81),(82),(83),
  (84),(85),(86),(87),(88),(89),(90),(91),(92),(93),(94),(95),(96),(97),(98),(99),(100),(101),(102),
  (103),(104),(105),(106),(107),(108),(109);

-- Вставка записей в таблицу teamHeroes
INSERT INTO teamHeroesVersus (teamid, teamname, heroID)
SELECT t.teamId, t.teamname, h.id
FROM teams t
CROSS JOIN tempHeroesVersus h
ORDER BY t.teamId, h.id;

-- Удаление временной таблицы
DROP TABLE tempHeroesVersus;

UPDATE teamHeroesVersus
SET matchesCount = 0,
    dirematchesCount = 0,
    radiantmatchesCount = 0,
    matchesWin = 0,
    dirematchesWin = 0,
    radiantmatchesWin = 0;

UPDATE teamHeroesVersus
SET
    matchesCount = matchesCount + (
        SELECT COUNT(*)
        FROM matches
        WHERE
            (teamHeroesVersus.teamID = matches.direTeamId
			AND (
                teamHeroesVersus.heroId = matches.radiantHero1
                OR teamHeroesVersus.heroId = matches.radiantHero2
                OR teamHeroesVersus.heroId = matches.radiantHero3
                OR teamHeroesVersus.heroId = matches.radiantHero4
                OR teamHeroesVersus.heroId = matches.radiantHero5
            ))
            OR
			(teamHeroesVersus.teamID = matches.radiantTeamId
			AND (
                teamHeroesVersus.heroId = matches.direHero1
                OR teamHeroesVersus.heroId = matches.direHero2
                OR teamHeroesVersus.heroId = matches.direHero3
                OR teamHeroesVersus.heroId = matches.direHero4
                OR teamHeroesVersus.heroId = matches.direHero5
            )) 
    ),
	    matcheswin = matcheswin + (
        SELECT COUNT(*)
        FROM matches
        WHERE
            (teamHeroesVersus.teamID = matches.direTeamId
			AND matches.didRadiantWin = 'false' 
			AND (
                teamHeroesVersus.heroId = matches.radiantHero1
                OR teamHeroesVersus.heroId = matches.radiantHero2
                OR teamHeroesVersus.heroId = matches.radiantHero3
                OR teamHeroesVersus.heroId = matches.radiantHero4
                OR teamHeroesVersus.heroId = matches.radiantHero5
            ))
            OR
			(teamHeroesVersus.teamID = matches.radiantTeamId
			AND matches.didRadiantWin = 'true' 
			AND (
                teamHeroesVersus.heroId = matches.direHero1
                OR teamHeroesVersus.heroId = matches.direHero2
                OR teamHeroesVersus.heroId = matches.direHero3
                OR teamHeroesVersus.heroId = matches.direHero4
                OR teamHeroesVersus.heroId = matches.direHero5
            ))
            
    ),
	    dirematchescount = dirematchescount + (
        SELECT COUNT(*)
        FROM matches
        WHERE
            teamHeroesVersus.teamID = matches.direTeamId
            AND (
                teamHeroesVersus.heroId = matches.radiantHero1
                OR teamHeroesVersus.heroId = matches.radiantHero2
                OR teamHeroesVersus.heroId = matches.radiantHero3
                OR teamHeroesVersus.heroId = matches.radiantHero4
                OR teamHeroesVersus.heroId = matches.radiantHero5
            )
    ),
	    dirematcheswin = dirematcheswin + (
        SELECT COUNT(*)
        FROM matches
        WHERE
            teamHeroesVersus.teamID = matches.direTeamId
			AND matches.didRadiantWin = 'false'
            AND (
                teamHeroesVersus.heroId = matches.radiantHero1
                OR teamHeroesVersus.heroId = matches.radiantHero2
                OR teamHeroesVersus.heroId = matches.radiantHero3
                OR teamHeroesVersus.heroId = matches.radiantHero4
                OR teamHeroesVersus.heroId = matches.radiantHero5
            )
	),	
		radiantmatchescount = radiantmatchescount + (
        SELECT COUNT(*)
        FROM matches
        WHERE
            teamHeroesVersus.teamID = matches.radiantTeamId
            AND (
                teamHeroesVersus.heroId = matches.direHero1
                OR teamHeroesVersus.heroId = matches.direHero2
                OR teamHeroesVersus.heroId = matches.direHero3
                OR teamHeroesVersus.heroId = matches.direHero4
                OR teamHeroesVersus.heroId = matches.direHero5
            )
    ),
		radiantmatcheswin = radiantmatcheswin + (
        SELECT COUNT(*)
        FROM matches
        WHERE
            teamHeroesVersus.teamID = matches.radiantTeamId
			AND matches.didRadiantWin = 'true'
            AND (
                teamHeroesVersus.heroId = matches.direHero1
                OR teamHeroesVersus.heroId = matches.direHero2
                OR teamHeroesVersus.heroId = matches.direHero3
                OR teamHeroesVersus.heroId = matches.direHero4
                OR teamHeroesVersus.heroId = matches.direHero5
            )

    );
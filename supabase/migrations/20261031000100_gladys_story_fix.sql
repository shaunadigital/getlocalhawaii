-- Gladys' Lei Stand story said the stand "has been on Lagoon Drive since 1948".
-- The stands left Lagoon Drive in 1962 and are on Rodgers Blvd today
-- (Hawaii Business, Oct 2020; Hawaiʻi Public Radio, Apr 2023).
update vendors
   set story = $t$Opened by Moana Umi, whose mother Rachel Aanana sold lei on the waterfront and on Maunakea Street. The family opened a lei stand on Lagoon Drive in 1948, per Hawaiʻi Public Radio.$t$
 where slug = 'gladys-lei-stand';

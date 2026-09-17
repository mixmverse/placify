-- Placify: Seed 27 batch3 curators (Heard + LetsSubmit)
-- Run this in Supabase SQL Editor AFTER the genre seed
-- Safe to re-run (uses ON CONFLICT DO NOTHING)
-- No playlist URLs found in this batch (all are /user/ URLs)

DO $$
DECLARE
  uid TEXT;
  gid TEXT;
BEGIN
  -- 1. Brandon Wolf Hill
  INSERT INTO "User" (id, email, "isCurator", "creditBalance", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, 'curator-brandon-wolf-hill@mixmverse.com', true, 0, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET "isCurator" = true
  RETURNING id INTO uid;

  INSERT INTO "CuratorProfile" (id, "userId", "displayName", bio, "priceCents", verified, "totalReviews", "onTimeReviews", "missedDeadlines", "retentionPoints", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, uid, 'Brandon Wolf Hill', 'Verified curator on LetsSubmit with 28 Spotify playlists and 117K+ total reach. 100% approval rate. Pop, Hip-Hop, Future House, Indie, Alt Pop, Dream Pop, Bedroom Pop. Active daily.', 200, true, 0, 0, 0, 0, NOW(), NOW())
  ON CONFLICT ("userId") DO NOTHING;

  SELECT id INTO gid FROM "Genre" WHERE name = 'Pop';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Hip-Hop';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Future House';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Indie';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Alternative';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Electronic';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;

  -- 2. New Peace Music
  INSERT INTO "User" (id, email, "isCurator", "creditBalance", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, 'curator-new-peace-music@mixmverse.com', true, 0, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET "isCurator" = true
  RETURNING id INTO uid;

  INSERT INTO "CuratorProfile" (id, "userId", "displayName", bio, "priceCents", verified, "totalReviews", "onTimeReviews", "missedDeadlines", "retentionPoints", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, uid, 'New Peace Music', 'Spanish curator, record label, and mixing/mastering engineer with 16 playlists and 29K reach. 20% approval rate. Verified on LetsSubmit.', 200, true, 0, 0, 0, 0, NOW(), NOW())
  ON CONFLICT ("userId") DO NOTHING;

  SELECT id INTO gid FROM "Genre" WHERE name = 'Electronic';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'House';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Chill';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Ambient';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Downtempo';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;

  -- 3. Unity Records
  INSERT INTO "User" (id, email, "isCurator", "creditBalance", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, 'curator-unity-records@mixmverse.com', true, 0, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET "isCurator" = true
  RETURNING id INTO uid;

  INSERT INTO "CuratorProfile" (id, "userId", "displayName", bio, "priceCents", verified, "totalReviews", "onTimeReviews", "missedDeadlines", "retentionPoints", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, uid, 'Unity Records', 'Major label curator on Heard. 391K playlist reach. Real audience, High activity, SH 5%. Featured Joya Mooi, Monét Ngo, JONES, Silly Boy Blue +76 more. High pitch quality.', 0, true, 0, 0, 0, 0, NOW(), NOW())
  ON CONFLICT ("userId") DO NOTHING;

  SELECT id INTO gid FROM "Genre" WHERE name = 'Rock';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Alternative';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Pop';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Indie';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Electronic';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;

  -- 4. Nine X
  INSERT INTO "User" (id, email, "isCurator", "creditBalance", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, 'curator-nine-x@mixmverse.com', true, 0, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET "isCurator" = true
  RETURNING id INTO uid;

  INSERT INTO "CuratorProfile" (id, "userId", "displayName", bio, "priceCents", verified, "totalReviews", "onTimeReviews", "missedDeadlines", "retentionPoints", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, uid, 'Nine X', 'Curator on Heard. 15K playlist reach. Real audience, Medium activity, SH 10%. Featured Mark Andrew Hansen, ReeToxA, The Killers, Nicky Youre, Ariana Grande, Macklemore +45 more.', 0, true, 0, 0, 0, 0, NOW(), NOW())
  ON CONFLICT ("userId") DO NOTHING;

  SELECT id INTO gid FROM "Genre" WHERE name = 'Rock';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Pop';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Indie Rock';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Alternative';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;

  -- 5. soundsdeli
  INSERT INTO "User" (id, email, "isCurator", "creditBalance", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, 'curator-soundsdeli@mixmverse.com', true, 0, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET "isCurator" = true
  RETURNING id INTO uid;

  INSERT INTO "CuratorProfile" (id, "userId", "displayName", bio, "priceCents", verified, "totalReviews", "onTimeReviews", "missedDeadlines", "retentionPoints", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, uid, 'soundsdeli', 'Curator on Heard. High activity, SH 7%. Featured Jungle, RAWAYANA, Khruangbin, Bad Bunny, berlioz, Sajmoonn +151 more. Eclectic taste spanning electronic, soul, world.', 0, true, 0, 0, 0, 0, NOW(), NOW())
  ON CONFLICT ("userId") DO NOTHING;

  SELECT id INTO gid FROM "Genre" WHERE name = 'Electronic';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Soul';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Hip-Hop';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Folk';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'World';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;

  -- 6. purefiresounds
  INSERT INTO "User" (id, email, "isCurator", "creditBalance", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, 'curator-purefiresounds@mixmverse.com', true, 0, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET "isCurator" = true
  RETURNING id INTO uid;

  INSERT INTO "CuratorProfile" (id, "userId", "displayName", bio, "priceCents", verified, "totalReviews", "onTimeReviews", "missedDeadlines", "retentionPoints", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, uid, 'purefiresounds', 'Curator on Heard. High activity, SH 23%. Featured Bad Bunny, Myke Towers, J Holland, daddy yankee, Eladio Carrion, Anuel AA +191 more. Strong Latin and dance music coverage.', 0, true, 0, 0, 0, 0, NOW(), NOW())
  ON CONFLICT ("userId") DO NOTHING;

  SELECT id INTO gid FROM "Genre" WHERE name = 'Electronic';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Dance';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'House';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Hip-Hop';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Reggaeton';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;

  -- 7. groove galaxy
  INSERT INTO "User" (id, email, "isCurator", "creditBalance", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, 'curator-groove-galaxy@mixmverse.com', true, 0, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET "isCurator" = true
  RETURNING id INTO uid;

  INSERT INTO "CuratorProfile" (id, "userId", "displayName", bio, "priceCents", verified, "totalReviews", "onTimeReviews", "missedDeadlines", "retentionPoints", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, uid, 'groove galaxy', 'Curator on Heard. High activity, SH 7%. Featured BNYX, Lil Uzi Vert, EARTHGANG, Smino, Lil Mosey, Iva Gonzo +13 more. Alternative hip-hop and trap focus.', 0, true, 0, 0, 0, 0, NOW(), NOW())
  ON CONFLICT ("userId") DO NOTHING;

  SELECT id INTO gid FROM "Genre" WHERE name = 'Alternative';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Hip-Hop';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Trap';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Soul';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;

  -- 8. roadie music
  INSERT INTO "User" (id, email, "isCurator", "creditBalance", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, 'curator-roadie-music@mixmverse.com', true, 0, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET "isCurator" = true
  RETURNING id INTO uid;

  INSERT INTO "CuratorProfile" (id, "userId", "displayName", bio, "priceCents", verified, "totalReviews", "onTimeReviews", "missedDeadlines", "retentionPoints", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, uid, 'roadie music', 'Curator on Heard. High activity, SH 38%. Rock, Soul, Hip Hop, Pop, Alternative. Consistently active with strong engagement.', 0, true, 0, 0, 0, 0, NOW(), NOW())
  ON CONFLICT ("userId") DO NOTHING;

  SELECT id INTO gid FROM "Genre" WHERE name = 'Rock';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Soul';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Hip-Hop';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Pop';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Alternative';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;

  -- 9. roadie metal
  INSERT INTO "User" (id, email, "isCurator", "creditBalance", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, 'curator-roadie-metal@mixmverse.com', true, 0, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET "isCurator" = true
  RETURNING id INTO uid;

  INSERT INTO "CuratorProfile" (id, "userId", "displayName", bio, "priceCents", verified, "totalReviews", "onTimeReviews", "missedDeadlines", "retentionPoints", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, uid, 'roadie metal', 'Curator on Heard. High activity, SH 36%. Rock, Metal, Hard Rock, Punk focus.', 0, true, 0, 0, 0, 0, NOW(), NOW())
  ON CONFLICT ("userId") DO NOTHING;

  SELECT id INTO gid FROM "Genre" WHERE name = 'Rock';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Metal';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Hard Rock';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Punk';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;

  -- 10. dj cosmin
  INSERT INTO "User" (id, email, "isCurator", "creditBalance", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, 'curator-dj-cosmin@mixmverse.com', true, 0, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET "isCurator" = true
  RETURNING id INTO uid;

  INSERT INTO "CuratorProfile" (id, "userId", "displayName", bio, "priceCents", verified, "totalReviews", "onTimeReviews", "missedDeadlines", "retentionPoints", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, uid, 'dj cosmin', 'Curator on Heard. Medium activity, SH 26%. Featured Cosmin, Criss Payne, Q.Age, SLEEP WHEEL +782 more artists. Massive curation scope.', 0, true, 0, 0, 0, 0, NOW(), NOW())
  ON CONFLICT ("userId") DO NOTHING;

  SELECT id INTO gid FROM "Genre" WHERE name = 'Electronic';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Rock';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Soul';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Pop';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Jazz';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;

  -- 11. Cosmicleaf
  INSERT INTO "User" (id, email, "isCurator", "creditBalance", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, 'curator-cosmicleaf@mixmverse.com', true, 0, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET "isCurator" = true
  RETURNING id INTO uid;

  INSERT INTO "CuratorProfile" (id, "userId", "displayName", bio, "priceCents", verified, "totalReviews", "onTimeReviews", "missedDeadlines", "retentionPoints", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, uid, 'Cosmicleaf', 'Greek curator on Heard. High activity, SH 25%. Electronic, Ambient, Downtempo, Chillhop, Experimental. Niche but dedicated audience.', 0, true, 0, 0, 0, 0, NOW(), NOW())
  ON CONFLICT ("userId") DO NOTHING;

  SELECT id INTO gid FROM "Genre" WHERE name = 'Electronic';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Ambient';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Downtempo';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Chillhop';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Experimental';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;

  -- 12. rockrivermgmt
  INSERT INTO "User" (id, email, "isCurator", "creditBalance", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, 'curator-rockrivermgmt@mixmverse.com', true, 0, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET "isCurator" = true
  RETURNING id INTO uid;

  INSERT INTO "CuratorProfile" (id, "userId", "displayName", bio, "priceCents", verified, "totalReviews", "onTimeReviews", "missedDeadlines", "retentionPoints", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, uid, 'rockrivermgmt', 'Curator on Heard. High activity, SH 15%. Featured Eric Lives Here, Drake, Mariah Carey, Noah Kahan, John Summit, Kygo +218 more. Major label connections.', 0, true, 0, 0, 0, 0, NOW(), NOW())
  ON CONFLICT ("userId") DO NOTHING;

  SELECT id INTO gid FROM "Genre" WHERE name = 'Electronic';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Dance';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'House';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Pop';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Hip-Hop';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;

  -- 13. pep garcia
  INSERT INTO "User" (id, email, "isCurator", "creditBalance", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, 'curator-pep-garcia@mixmverse.com', true, 0, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET "isCurator" = true
  RETURNING id INTO uid;

  INSERT INTO "CuratorProfile" (id, "userId", "displayName", bio, "priceCents", verified, "totalReviews", "onTimeReviews", "missedDeadlines", "retentionPoints", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, uid, 'pep garcia', 'Curator on Heard. High activity, SH 8%. Featured horsegiirL, DJ Seinfeld, Modest Mouse, Olivia Rodrigo +148 more. Eclectic electronic and indie taste.', 0, true, 0, 0, 0, 0, NOW(), NOW())
  ON CONFLICT ("userId") DO NOTHING;

  SELECT id INTO gid FROM "Genre" WHERE name = 'Electronic';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Dance';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'House';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Pop';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Indie';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;

  -- 14. dunk vibes
  INSERT INTO "User" (id, email, "isCurator", "creditBalance", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, 'curator-dunk-vibes@mixmverse.com', true, 0, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET "isCurator" = true
  RETURNING id INTO uid;

  INSERT INTO "CuratorProfile" (id, "userId", "displayName", bio, "priceCents", verified, "totalReviews", "onTimeReviews", "missedDeadlines", "retentionPoints", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, uid, 'dunk vibes', 'Curator on Heard. Medium activity, SH 28%. Featured Drake, Don Toliver, Pitbull, Can U, Yere +246 more. Dance and pop crossover.', 0, true, 0, 0, 0, 0, NOW(), NOW())
  ON CONFLICT ("userId") DO NOTHING;

  SELECT id INTO gid FROM "Genre" WHERE name = 'Electronic';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Dance';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'House';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Hip-Hop';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Pop';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;

  -- 15. cvsket pretty
  INSERT INTO "User" (id, email, "isCurator", "creditBalance", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, 'curator-cvsket-pretty@mixmverse.com', true, 0, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET "isCurator" = true
  RETURNING id INTO uid;

  INSERT INTO "CuratorProfile" (id, "userId", "displayName", bio, "priceCents", verified, "totalReviews", "onTimeReviews", "missedDeadlines", "retentionPoints", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, uid, 'cvsket pretty', 'Curator on Heard. Medium activity, SH 43%. Featured Hamdi, Zingara, Tim Schaufert, Phlocalyst +218 more. Lo-fi and chillhop specialist.', 0, true, 0, 0, 0, 0, NOW(), NOW())
  ON CONFLICT ("userId") DO NOTHING;

  SELECT id INTO gid FROM "Genre" WHERE name = 'Hip-Hop';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Lo-Fi';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Downtempo';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Chillhop';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Experimental';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;

  -- 16. Christian Vibes
  INSERT INTO "User" (id, email, "isCurator", "creditBalance", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, 'curator-christian-vibes@mixmverse.com', true, 0, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET "isCurator" = true
  RETURNING id INTO uid;

  INSERT INTO "CuratorProfile" (id, "userId", "displayName", bio, "priceCents", verified, "totalReviews", "onTimeReviews", "missedDeadlines", "retentionPoints", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, uid, 'Christian Vibes', 'UK curator on Heard. High activity. Electronic, Hip Hop, Pop, Dance, Rock. Active and consistent.', 0, true, 0, 0, 0, 0, NOW(), NOW())
  ON CONFLICT ("userId") DO NOTHING;

  SELECT id INTO gid FROM "Genre" WHERE name = 'Electronic';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Hip-Hop';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Pop';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Dance';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Rock';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;

  -- 17. frequency state
  INSERT INTO "User" (id, email, "isCurator", "creditBalance", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, 'curator-frequency-state@mixmverse.com', true, 0, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET "isCurator" = true
  RETURNING id INTO uid;

  INSERT INTO "CuratorProfile" (id, "userId", "displayName", bio, "priceCents", verified, "totalReviews", "onTimeReviews", "missedDeadlines", "retentionPoints", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, uid, 'frequency state', 'UK curator on Heard. High activity, SH 7%. Electronic, Experimental, Ambient. Niche but quality-driven.', 0, true, 0, 0, 0, 0, NOW(), NOW())
  ON CONFLICT ("userId") DO NOTHING;

  SELECT id INTO gid FROM "Genre" WHERE name = 'Electronic';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Experimental';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Ambient';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Techno';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;

  -- 18. zone nights
  INSERT INTO "User" (id, email, "isCurator", "creditBalance", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, 'curator-zone-nights@mixmverse.com', true, 0, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET "isCurator" = true
  RETURNING id INTO uid;

  INSERT INTO "CuratorProfile" (id, "userId", "displayName", bio, "priceCents", verified, "totalReviews", "onTimeReviews", "missedDeadlines", "retentionPoints", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, uid, 'zone nights', 'Curator on Heard. High activity, SH 65%. Electronic, House, Techno. Strong acceptance rate.', 0, true, 0, 0, 0, 0, NOW(), NOW())
  ON CONFLICT ("userId") DO NOTHING;

  SELECT id INTO gid FROM "Genre" WHERE name = 'Electronic';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'House';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Techno';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Deep House';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;

  -- 19. zona emergente
  INSERT INTO "User" (id, email, "isCurator", "creditBalance", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, 'curator-zona-emergente@mixmverse.com', true, 0, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET "isCurator" = true
  RETURNING id INTO uid;

  INSERT INTO "CuratorProfile" (id, "userId", "displayName", bio, "priceCents", verified, "totalReviews", "onTimeReviews", "missedDeadlines", "retentionPoints", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, uid, 'zona emergente', 'Curator on Heard. High activity, SH 53%. Rock and Pop focus. Strong acceptance rate.', 0, true, 0, 0, 0, 0, NOW(), NOW())
  ON CONFLICT ("userId") DO NOTHING;

  SELECT id INTO gid FROM "Genre" WHERE name = 'Rock';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Pop';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Alternative';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;

  -- 20. vinylhoops
  INSERT INTO "User" (id, email, "isCurator", "creditBalance", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, 'curator-vinylhoops@mixmverse.com', true, 0, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET "isCurator" = true
  RETURNING id INTO uid;

  INSERT INTO "CuratorProfile" (id, "userId", "displayName", bio, "priceCents", verified, "totalReviews", "onTimeReviews", "missedDeadlines", "retentionPoints", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, uid, 'vinylhoops', 'Curator on Heard. High activity, SH 30%. Rock, Soul, Hip Hop, Pop, Jazz.', 0, true, 0, 0, 0, 0, NOW(), NOW())
  ON CONFLICT ("userId") DO NOTHING;

  SELECT id INTO gid FROM "Genre" WHERE name = 'Rock';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Soul';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Hip-Hop';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Pop';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Jazz';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;

  -- 21. velveteen records
  INSERT INTO "User" (id, email, "isCurator", "creditBalance", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, 'curator-velveteen-records@mixmverse.com', true, 0, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET "isCurator" = true
  RETURNING id INTO uid;

  INSERT INTO "CuratorProfile" (id, "userId", "displayName", bio, "priceCents", verified, "totalReviews", "onTimeReviews", "missedDeadlines", "retentionPoints", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, uid, 'velveteen records', 'Curator on Heard. Medium activity, SH 46%. Electronic, House, Country. Unique cross-genre curation.', 0, true, 0, 0, 0, 0, NOW(), NOW())
  ON CONFLICT ("userId") DO NOTHING;

  SELECT id INTO gid FROM "Genre" WHERE name = 'Electronic';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'House';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Country';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Indie';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Folk';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;

  -- 22. r chy
  INSERT INTO "User" (id, email, "isCurator", "creditBalance", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, 'curator-r-chy@mixmverse.com', true, 0, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET "isCurator" = true
  RETURNING id INTO uid;

  INSERT INTO "CuratorProfile" (id, "userId", "displayName", bio, "priceCents", verified, "totalReviews", "onTimeReviews", "missedDeadlines", "retentionPoints", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, uid, 'r chy', 'Curator on Heard. High activity, SH 26%. Electronic, House, Rock crossover.', 0, true, 0, 0, 0, 0, NOW(), NOW())
  ON CONFLICT ("userId") DO NOTHING;

  SELECT id INTO gid FROM "Genre" WHERE name = 'Electronic';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'House';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Rock';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Techno';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Dance';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;

  -- 23. songpickr
  INSERT INTO "User" (id, email, "isCurator", "creditBalance", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, 'curator-songpickr@mixmverse.com', true, 0, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET "isCurator" = true
  RETURNING id INTO uid;

  INSERT INTO "CuratorProfile" (id, "userId", "displayName", bio, "priceCents", verified, "totalReviews", "onTimeReviews", "missedDeadlines", "retentionPoints", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, uid, 'songpickr', 'Curator on Heard. High activity, SH 5%. Rock, Country, Americana, Folk. Americana specialist.', 0, true, 0, 0, 0, 0, NOW(), NOW())
  ON CONFLICT ("userId") DO NOTHING;

  SELECT id INTO gid FROM "Genre" WHERE name = 'Rock';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Country';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Folk';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Indie';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;

  -- 24. ruslan yasynskyi
  INSERT INTO "User" (id, email, "isCurator", "creditBalance", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, 'curator-ruslan-yasynskyi@mixmverse.com', true, 0, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET "isCurator" = true
  RETURNING id INTO uid;

  INSERT INTO "CuratorProfile" (id, "userId", "displayName", bio, "priceCents", verified, "totalReviews", "onTimeReviews", "missedDeadlines", "retentionPoints", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, uid, 'ruslan yasynskyi', 'Curator on Heard. High activity, SH 20%. Electronic, House, Techno focus.', 0, true, 0, 0, 0, 0, NOW(), NOW())
  ON CONFLICT ("userId") DO NOTHING;

  SELECT id INTO gid FROM "Genre" WHERE name = 'Electronic';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'House';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Techno';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Dance';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Deep House';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;

  -- 25. plan arteria
  INSERT INTO "User" (id, email, "isCurator", "creditBalance", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, 'curator-plan-arteria@mixmverse.com', true, 0, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET "isCurator" = true
  RETURNING id INTO uid;

  INSERT INTO "CuratorProfile" (id, "userId", "displayName", bio, "priceCents", verified, "totalReviews", "onTimeReviews", "missedDeadlines", "retentionPoints", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, uid, 'plan arteria', 'Curator on Heard. High activity, SH 7%. Rock, Alternative, Folk. Indie-focused.', 0, true, 0, 0, 0, 0, NOW(), NOW())
  ON CONFLICT ("userId") DO NOTHING;

  SELECT id INTO gid FROM "Genre" WHERE name = 'Rock';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Alternative';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Folk';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Indie';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Pop';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;

  -- 26. rodmusic
  INSERT INTO "User" (id, email, "isCurator", "creditBalance", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, 'curator-rodmusic@mixmverse.com', true, 0, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET "isCurator" = true
  RETURNING id INTO uid;

  INSERT INTO "CuratorProfile" (id, "userId", "displayName", bio, "priceCents", verified, "totalReviews", "onTimeReviews", "missedDeadlines", "retentionPoints", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, uid, 'rodmusic', 'Curator on Heard. High activity, SH 2%. Electronic and Pop.', 0, true, 0, 0, 0, 0, NOW(), NOW())
  ON CONFLICT ("userId") DO NOTHING;

  SELECT id INTO gid FROM "Genre" WHERE name = 'Electronic';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Pop';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Dance';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;

  -- 27. Florito
  INSERT INTO "User" (id, email, "isCurator", "creditBalance", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, 'curator-florito@mixmverse.com', true, 0, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET "isCurator" = true
  RETURNING id INTO uid;

  INSERT INTO "CuratorProfile" (id, "userId", "displayName", bio, "priceCents", verified, "totalReviews", "onTimeReviews", "missedDeadlines", "retentionPoints", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, uid, 'Florito', 'Curator on Heard. Medium activity, SH 25%, 4.7K reach. Hip Hop, Downtempo, Chillhop, Jazz. Featured Martin Liege, Lofi Jazz Cafe +44 more.', 0, true, 0, 0, 0, 0, NOW(), NOW())
  ON CONFLICT ("userId") DO NOTHING;

  SELECT id INTO gid FROM "Genre" WHERE name = 'Hip-Hop';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Downtempo';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Chillhop';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO gid FROM "Genre" WHERE name = 'Jazz';
  IF gid IS NOT NULL THEN
    INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES (uid, gid) ON CONFLICT DO NOTHING;
  END IF;

END $$;

SELECT COUNT(*) as batch3_curators FROM "User" WHERE email LIKE 'curator-%@mixmverse.com';

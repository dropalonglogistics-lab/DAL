const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const envLines = envFile.split('\n');
const env = {};
for (const line of envLines) {
    if (line.includes('=')) {
        const [key, ...valueParts] = line.split('=');
        env[key.trim()] = valueParts.join('=')
            .trim()
            .replace(/^["']/, '')
            .replace(/["']\r?$/, '');
    }
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDuplicates() {
    console.log("Fetching all rows for 'ekechristopher56@gmail.com'...");

    // Use .select() without .single() to get an array of duplicates
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', 'ekechristopher56@gmail.com');

    if (error) {
        console.error("Error fetching profiles:", error);
        return;
    }

    console.log(`Found ${profiles?.length || 0} records.`);

    if (profiles && profiles.length > 1) {
        console.log("Duplicate records found:", JSON.stringify(profiles, null, 2));

        // Strategy: We need the user to tell us which ID is the REAL one from Auth.
        // But since we can't easily query Auth without the service role key, 
        // let's print them out nicely for the user, and generate an SQL script for them.

        let sqlCommands = `-- Run this in your Supabase SQL Editor to fix the duplicate profile issue:\n\n`;

        // Assume the one with more points or the older one is the "primary"
        // Better yet, just output all of them and give instructions on how to use Auth IDs

        console.log("\n--- INSTRUCTIONS FOR USER ---");
        console.log("You have duplicate profiles. This breaks the app.");
        console.log("Because my script lacks the Service Role Key, I cannot automatically delete the false one.");
        console.log("Please go to your Supabase Dashboard -> Authentication -> Users.");
        console.log("Find the user ID for ekechristopher56@gmail.com.");
        console.log("Then, run a query like this in your SQL Editor to delete the BAD row(s):");

        for (const p of profiles) {
            console.log(`\nDELETE FROM public.profiles WHERE id = '${p.id}' AND email = 'ekechristopher56@gmail.com'; -- (Has ${p.points} points)`);
        }

    } else {
        console.log("No duplicates found. The issue might be something else.");
    }
}

fixDuplicates();

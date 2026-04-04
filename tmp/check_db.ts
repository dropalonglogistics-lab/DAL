import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bujrhfdfrxicaeuazmxv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1anJoZmRmcnhpY2FldWF6bXh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMjYwNTUsImV4cCI6MjA4NDYwMjA1NX0.iuhEjR0uwD7bUkVV47E5ucb_5-DXFEXcz9IFrLru4Nk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRoutes() {
    console.log('Checking routes table...');
    const { data, error, count } = await supabase
        .from('routes')
        .select('*', { count: 'exact' })
        .limit(1);

    if (error) {
        console.error('Error fetching routes:', error);
    } else {
        console.log('Total routes:', count);
        console.log('Sample route columns:', Object.keys(data[0] || {}));
    }
}

checkRoutes();

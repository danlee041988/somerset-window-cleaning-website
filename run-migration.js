#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Supabase configuration
const supabaseUrl = 'https://puqfbuqfxghffdbbqrvo.supabase.co'

// You need to provide the service key here (found in Supabase Dashboard > Settings > API)
const serviceKey = process.env.SUPABASE_SERVICE_KEY

if (!serviceKey) {
    console.error('❌ Error: SUPABASE_SERVICE_KEY environment variable is required')
    console.error('   Find your service key in: Supabase Dashboard > Settings > API > Service Role Key')
    console.error('   Run with: SUPABASE_SERVICE_KEY=your_service_key node run-migration.js')
    process.exit(1)
}

// Create Supabase client with service key for admin operations
const supabase = createClient(supabaseUrl, serviceKey)

async function readMigrationFile() {
    try {
        const migrationPath = join(__dirname, 'supabase_migration_schema_corrected.sql')
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
        return migrationSQL
    } catch (error) {
        console.error('❌ Error reading migration file:', error.message)
        return null
    }
}

async function runMigration() {
    console.log('🚀 Somerset Window Cleaning - Database Migration')
    console.log('='.repeat(50))
    
    const migrationSQL = await readMigrationFile()
    if (!migrationSQL) {
        console.error('❌ Cannot proceed without migration file')
        return false
    }
    
    console.log('📝 Running database migration...')
    console.log(`   File: supabase_migration_schema_corrected.sql`)
    console.log(`   Size: ${(migrationSQL.length / 1024).toFixed(1)}KB`)
    
    try {
        // Split the SQL into individual statements
        const statements = migrationSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
        
        console.log(`   Statements: ${statements.length}`)
        console.log('')
        
        let successCount = 0
        let errorCount = 0
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i] + ';'
            
            // Skip comments and empty statements
            if (statement.trim() === ';' || statement.startsWith('--')) {
                continue
            }
            
            try {
                const { data, error } = await supabase.rpc('exec_sql', { query: statement })
                
                if (error) {
                    console.error(`❌ Statement ${i + 1} failed:`, error.message)
                    console.error(`   SQL: ${statement.substring(0, 100)}...`)
                    errorCount++
                } else {
                    console.log(`✅ Statement ${i + 1} executed successfully`)
                    successCount++
                }
            } catch (err) {
                console.error(`❌ Statement ${i + 1} error:`, err.message)
                errorCount++
            }
            
            // Add a small delay to avoid overwhelming the database
            await new Promise(resolve => setTimeout(resolve, 100))
        }
        
        console.log('')
        console.log('📊 MIGRATION SUMMARY:')
        console.log('='.repeat(30))
        console.log(`✅ Successful: ${successCount}`)
        console.log(`❌ Errors: ${errorCount}`)
        
        if (errorCount === 0) {
            console.log('🎉 Migration completed successfully!')
            return true
        } else {
            console.log('⚠️  Migration completed with errors')
            return false
        }
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message)
        return false
    }
}

async function verifyMigration() {
    console.log('\n🔍 Verifying migration...')
    
    const tables = ['customers', 'services', 'service_areas', 'bookings', 'customer_communications']
    
    for (const table of tables) {
        try {
            const { data, error } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true })
            
            if (error) {
                console.log(`❌ ${table}: ${error.message}`)
            } else {
                console.log(`✅ ${table}: Table exists and accessible`)
            }
        } catch (err) {
            console.log(`❌ ${table}: ${err.message}`)
        }
    }
    
    // Test sample data
    try {
        const { data: services, error: servicesError } = await supabase
            .from('services')
            .select('name, slug, base_price')
        
        if (servicesError) {
            console.log(`❌ Sample services data: ${servicesError.message}`)
        } else {
            console.log(`✅ Sample services data: ${services.length} services loaded`)
        }
        
        const { data: areas, error: areasError } = await supabase
            .from('service_areas')
            .select('area_name, postcode_prefix')
        
        if (areasError) {
            console.log(`❌ Sample areas data: ${areasError.message}`)
        } else {
            console.log(`✅ Sample areas data: ${areas.length} areas loaded`)
        }
    } catch (err) {
        console.log(`❌ Sample data verification failed: ${err.message}`)
    }
}

async function main() {
    const migrationSuccess = await runMigration()
    
    if (migrationSuccess) {
        await verifyMigration()
        
        console.log('\n🎯 Next Steps:')
        console.log('1. Test your website booking form')
        console.log('2. Check the Supabase dashboard to view your data')
        console.log('3. Run: node setup-database.js (for ongoing verification)')
        console.log('4. Configure Row Level Security policies as needed')
    } else {
        console.log('\n🔧 Troubleshooting:')
        console.log('1. Check that your service key has admin permissions')
        console.log('2. Verify the migration file exists and is readable')
        console.log('3. Try running sections of the migration manually in SQL Editor')
    }
}

// Run the migration
main().catch(console.error)
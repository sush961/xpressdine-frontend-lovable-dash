import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 NEXT.JS DEBUG: RESERVATION REQUEST RECEIVED');
  console.log('='.repeat(60));
  
  try {
    // 1. PARSE REQUEST BODY
    const body = await request.json();
    
    // 2. RAW REQUEST ANALYSIS
    console.log('📋 Raw Request Details:');
    console.log('  Content-Type:', request.headers.get('content-type'));
    console.log('  Method:', request.method);
    console.log('  URL:', request.url);
    console.log('  Body Type:', typeof body);
    console.log('  Body Keys:', Object.keys(body || {}));
    console.log('  Raw Body:', JSON.stringify(body, null, 2));
    
    // 3. COMPREHENSIVE FIELD VALIDATION
    console.log('\n📝 Individual Field Analysis:');
    const requiredFields = [
      { name: 'guest_id', type: 'string', validation: 'uuid' },
      { name: 'restaurant_id', type: 'string', validation: 'uuid' },
      { name: 'table_id', type: 'string', validation: 'uuid' },
      { name: 'date_time', type: 'string', validation: 'iso_date' },
      { name: 'party_size', type: 'number', validation: 'positive_integer' }
    ];
    
    const optionalFields = [
      { name: 'status', type: 'string', validation: 'enum' },
      { name: 'notes', type: 'string', validation: 'text' }
    ];
    
    const missingFields: string[] = [];
    const invalidFields: Array<{field: string, issue: string, value: any}> = [];
    const validFields: string[] = [];
    
    // UUID validation regex
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    // Check required fields
    requiredFields.forEach(field => {
      const value = body[field.name];
      const exists = value !== undefined && value !== null && value !== '';
      const typeMatch = typeof value === field.type;
      
      console.log(`  ${field.name}:`);
      console.log(`    Value: ${JSON.stringify(value)}`);
      console.log(`    Exists: ${exists}`);
      console.log(`    Type: ${typeof value} (expected: ${field.type})`);
      console.log(`    Type Match: ${typeMatch}`);
      
      if (!exists) {
        missingFields.push(field.name);
        console.log(`    ❌ MISSING OR EMPTY`);
      } else if (!typeMatch) {
        invalidFields.push({
          field: field.name, 
          issue: `Wrong type: ${typeof value}, expected: ${field.type}`,
          value: value
        });
        console.log(`    ❌ WRONG TYPE`);
      } else {
        // Additional validation
        let validationPassed = true;
        let validationMessage = '';
        
        switch(field.validation) {
          case 'uuid':
            validationPassed = uuidRegex.test(value);
            validationMessage = validationPassed ? 'Valid UUID' : 'Invalid UUID format';
            break;
          case 'iso_date':
            validationPassed = !isNaN(Date.parse(value));
            validationMessage = validationPassed ? 'Valid ISO date' : 'Invalid date format';
            if (validationPassed) {
              const date = new Date(value);
              const now = new Date();
              validationMessage += ` (Date: ${date.toISOString()}, Future: ${date > now})`;
            }
            break;
          case 'positive_integer':
            validationPassed = Number.isInteger(value) && value > 0;
            validationMessage = validationPassed ? 'Valid positive integer' : 'Must be positive integer > 0';
            break;
        }
        
        console.log(`    Validation: ${validationMessage}`);
        if (!validationPassed) {
          invalidFields.push({
            field: field.name, 
            issue: validationMessage,
            value: value
          });
          console.log(`    ❌ VALIDATION FAILED`);
        } else {
          validFields.push(field.name);
          console.log(`    ✅ VALID`);
        }
      }
    });
    
    // Check optional fields
    console.log('\n📋 Optional Fields:');
    optionalFields.forEach(field => {
      const value = body[field.name];
      console.log(`  ${field.name}: ${JSON.stringify(value)} (${typeof value})`);
      
      if (field.name === 'status' && value) {
        const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'];
        const isValidStatus = validStatuses.includes(value);
        console.log(`    Status validation: ${isValidStatus ? '✅ Valid' : '❌ Invalid'} (allowed: ${validStatuses.join(', ')})`);
      }
    });
    
    // 4. VALIDATION SUMMARY
    console.log('\n📊 Validation Summary:');
    console.log(`  ✅ Valid Fields (${validFields.length}): ${validFields.join(', ')}`);
    console.log(`  ❌ Missing Fields (${missingFields.length}): ${missingFields.length > 0 ? missingFields.join(', ') : 'None'}`);
    console.log(`  ❌ Invalid Fields (${invalidFields.length}): ${invalidFields.length > 0 ? invalidFields.map(i => `${i.field} (${i.issue})`).join(', ') : 'None'}`);
    
    // 5. SUPABASE-STYLE SIMULATION
    console.log('\n🔗 Simulating Supabase Reference Validation:');
    console.log(`  [SIMULATED] SELECT * FROM guests WHERE id = '${body.guest_id}'`);
    console.log(`  [SIMULATED] Guest exists: true (simulated)`);
    console.log(`  [SIMULATED] SELECT * FROM restaurants WHERE id = '${body.restaurant_id}'`);
    console.log(`  [SIMULATED] Restaurant exists: true (simulated)`);
    console.log(`  [SIMULATED] SELECT * FROM tables WHERE id = '${body.table_id}'`);
    console.log(`  [SIMULATED] Table exists: true (simulated)`);
    
    // 6. FINAL ASSESSMENT
    const hasErrors = missingFields.length > 0 || invalidFields.length > 0;
    
    if (hasErrors) {
      console.log('\n❌ VALIDATION FAILED - Would return 400 error in production');
      console.log('='.repeat(60) + '\n');
      
      return NextResponse.json({
        success: false,
        error: 'Debug validation failed',
        debug_results: {
          missing_fields: missingFields,
          invalid_fields: invalidFields,
          valid_fields: validFields,
          received_body: body,
          validation_summary: {
            total_fields_received: Object.keys(body || {}).length,
            required_fields_count: requiredFields.length,
            valid_fields_count: validFields.length,
            missing_fields_count: missingFields.length,
            invalid_fields_count: invalidFields.length
          },
          framework: 'Next.js',
          database: 'Supabase'
        }
      }, { status: 400 });
    } else {
      console.log('\n✅ All validations passed - Ready for production');
      console.log('  (No actual Supabase insertion occurred)');
      console.log('\n[SIMULATED] Would execute Supabase query:');
      console.log(`  supabase.from('reservations').insert(${JSON.stringify(body, null, 2)})`);
      console.log('\n🎉 DEBUG MODE: Validation successful - No changes were made to Supabase');
      console.log('='.repeat(60) + '\n');
      
      return NextResponse.json({
        success: true,
        message: 'Debug validation passed - would create reservation in production',
        debug_results: {
          validation_status: 'PASSED',
          valid_fields: validFields,
          received_body: body,
          simulated_creation: true,
          validation_summary: {
            total_fields_received: Object.keys(body || {}).length,
            required_fields_count: requiredFields.length,
            valid_fields_count: validFields.length,
            all_required_present: validFields.length >= requiredFields.length
          },
          framework: 'Next.js',
          database: 'Supabase',
          would_execute: `supabase.from('reservations').insert(${JSON.stringify(body)})`
        }
      }, { status: 200 });
    }
    
  } catch (error) {
    console.log('\n💥 REQUEST PARSING ERROR:');
    console.log('  Error message:', error.message);
    console.log('  Error stack:', error.stack);
    console.log('='.repeat(60) + '\n');
    
    return NextResponse.json({
      success: false,
      error: 'Request parsing failed',
      message: error.message,
      debug_info: {
        timestamp: new Date().toISOString(),
        framework: 'Next.js',
        error_type: 'JSON_PARSE_ERROR'
      }
    }, { status: 400 });
  }
}

export const dynamic = 'force-dynamic';

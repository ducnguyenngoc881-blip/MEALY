import { mockMealSets } from '../src/data/mockMealSets';

console.log('Total meal sets:', mockMealSets.length);
let costMismatches = 0;
let calMismatches = 0;

for (const set of mockMealSets) {
  const sumDishes = set.mainDish.estimatedCostVnd + set.soupDish.estimatedCostVnd + set.sideDish.estimatedCostVnd;
  const sumCals = set.mainDish.calories + set.soupDish.calories + set.sideDish.calories;
  const isCostDiff = sumDishes !== set.totalCostVnd;
  const isCalDiff = sumCals !== set.totalCalories;
  
  if (isCostDiff || isCalDiff) {
    if (isCostDiff) costMismatches++;
    if (isCalDiff) calMismatches++;
    console.log(`[MISMATCH] ${set.title} (${set.id}):`);
    console.log(`  Cost: set.totalCostVnd=${set.totalCostVnd}, sumDishes=${sumDishes} (diff=${sumDishes - set.totalCostVnd})`);
    console.log(`    main (${set.mainDish.id}): ${set.mainDish.estimatedCostVnd}`);
    console.log(`    soup (${set.soupDish.id}): ${set.soupDish.estimatedCostVnd}`);
    console.log(`    side (${set.sideDish.id}): ${set.sideDish.estimatedCostVnd}`);
    console.log(`  Calories: set.totalCalories=${set.totalCalories}, sumCals=${sumCals} (diff=${sumCals - set.totalCalories})`);
  }
}

console.log(`Summary: ${costMismatches} cost mismatches, ${calMismatches} cal mismatches out of ${mockMealSets.length} sets.`);

import { testFetchArea } from './src/servicios/documentacion/areaProvider.tsx';

// Run the test
testFetchArea().then(() => {
    console.log('Test completed');
}).catch(error => {
    console.error('Test failed:', error);
});

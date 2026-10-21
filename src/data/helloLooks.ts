export type GarmentStyle = 'tee' | 'graphic' | 'cargo' | 'hoodie' | 'mono' | 'denim' | 'layers' | 'signature';
export type FigureLook = { top: string; pants: string; accent: string; style: GarmentStyle };
export type HelloLook = {
  id: string;
  name: string;
  description: string;
  image: string;
  imagePosition: string;
  maleLook: FigureLook;
  femaleLook: FigureLook;
  palette: readonly string[];
  categoryHref: string;
  isDemo: boolean;
  // Populate only with verified catalog associations when approved looks arrive.
  productIds: readonly string[];
};

export const helloLooks: readonly HelloLook[] = [
  { id: 'look-01', name: 'Essential oversized tee', description: 'An easy silhouette. A quiet statement.', image: '/demo/looks/look-01.webp', imagePosition: '50% 50%', maleLook: {top:'#222322',pants:'#292927',accent:'#e5e0d5',style:'tee'}, femaleLook: {top:'#31312f',pants:'#191b1b',accent:'#e5e0d5',style:'tee'}, palette:['#202120','#444541','#ded9ce'], categoryHref:'/collections/t-shirts', isDemo:true, productIds:[] },
  { id: 'look-02', name: 'Graphic street tee', description: 'A little louder. Entirely your own.', image: '/demo/looks/look-02.webp', imagePosition: '50% 50%', maleLook: {top:'#ded7c6',pants:'#242521',accent:'#292c28',style:'graphic'}, femaleLook: {top:'#efebe0',pants:'#383a36',accent:'#292c28',style:'graphic'}, palette:['#e4ddce','#f4f1ea','#252623'], categoryHref:'/collections/t-shirts', isDemo:true, productIds:[] },
  { id: 'look-03', name: 'Cargo fit', description: 'Room to move. Built for the everyday.', image: '/demo/looks/look-03.webp', imagePosition: '50% 50%', maleLook: {top:'#8c897c',pants:'#5b6250',accent:'#c4c2ae',style:'cargo'}, femaleLook: {top:'#414841',pants:'#7a7b65',accent:'#cac5b5',style:'cargo'}, palette:['#8c897c','#5b6250','#414841'], categoryHref:'/collections/pants', isDemo:true, productIds:[] },
  { id: 'look-04', name: 'Hoodie drop', description: 'Soft layers. Strong presence.', image: '/demo/looks/look-04.webp', imagePosition: '50% 50%', maleLook: {top:'#9d9b96',pants:'#333635',accent:'#dedbd2',style:'hoodie'}, femaleLook: {top:'#333532',pants:'#8c8b85',accent:'#dedbd2',style:'hoodie'}, palette:['#9d9b96','#333532','#d7d3ca'], categoryHref:'/collections/hoodies', isDemo:true, productIds:[] },
  { id: 'look-05', name: 'Monochrome set', description: 'Less noise. More you.', image: '/demo/looks/look-05.webp', imagePosition: '50% 50%', maleLook: {top:'#343735',pants:'#222523',accent:'#92948b',style:'mono'}, femaleLook: {top:'#1b1d1b',pants:'#424642',accent:'#92948b',style:'mono'}, palette:['#1b1d1b','#343735','#555a55'], categoryHref:'/shop', isDemo:true, productIds:[] },
  { id: 'look-06', name: 'Relaxed denim', description: 'Off duty. On your terms.', image: '/demo/looks/look-06.webp', imagePosition: '50% 50%', maleLook: {top:'#e8e1d2',pants:'#586979',accent:'#b7c0c4',style:'denim'}, femaleLook: {top:'#d6cfbf',pants:'#75838b',accent:'#c5cbcb',style:'denim'}, palette:['#e8e1d2','#586979','#75838b'], categoryHref:'/collections/pants', isDemo:true, productIds:[] },
  { id: 'look-07', name: 'Urban layers', description: 'Depth, texture, a different perspective.', image: '/demo/looks/look-07.webp', imagePosition: '50% 50%', maleLook: {top:'#7a6d56',pants:'#393b36',accent:'#e3dbca',style:'layers'}, femaleLook: {top:'#697266',pants:'#282c29',accent:'#ded8cc',style:'layers'}, palette:['#7a6d56','#697266','#e3dbca'], categoryHref:'/shop', isDemo:true, productIds:[] },
  { id: 'look-08', name: 'HELLO! signature', description: 'The mark is ours. The style is yours.', image: '/demo/looks/look-08.webp', imagePosition: '50% 50%', maleLook: {top:'#191c1b',pants:'#c5bca7',accent:'#f1ebdf',style:'signature'}, femaleLook: {top:'#ded6c3',pants:'#242724',accent:'#1e2420',style:'signature'}, palette:['#191c1b','#c5bca7','#eae3d4'], categoryHref:'/collections/t-shirts', isDemo:true, productIds:[] },
];

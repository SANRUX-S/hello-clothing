import {describe,it,expect} from 'vitest';
import {normalizeCart,cartSubtotal} from '../src/lib/cart';
import {money,searchProducts} from '../src/lib/catalog';
describe('guest cart browser input',()=>{
 it('rejects missing products, invalid variants and malformed quantities',()=>{expect(normalizeCart([{productId:'absent',size:'L',color:'Black',quantity:1},{productId:'essential-tee',size:'FAKE',color:'Black',quantity:1},{productId:'essential-tee',size:'M',color:'Black',quantity:1.5}])).toEqual([]);});
 it('merges duplicate variants and caps their quantity',()=>{expect(normalizeCart([{productId:'essential-tee',size:'M',color:'Black',quantity:7},{productId:'essential-tee',size:'M',color:'Black',quantity:8}])).toEqual([{productId:'essential-tee',size:'M',color:'Black',quantity:10}]);});
 it('caps combined size/color quantities at the demo product stock',()=>{const cart=normalizeCart(['S','M','L','XL'].map(size=>({productId:'oversized-hoodie',size,color:'Black',quantity:10})));expect(cart.reduce((sum,line)=>sum+line.quantity,0)).toBe(12);});
 it('calculates precise subtotals from trusted catalog prices',()=>{expect(cartSubtotal([{productId:'essential-tee',size:'M',color:'Black',quantity:2},{productId:'classic-cap',size:'One Size',color:'Off White',quantity:1}])).toBe(997000);expect(money(997000)).toBe('LKR 9,970');});
 it('searches product details case insensitively',()=>{expect(searchProducts('HOODIE').map(p=>p.id)).toContain('oversized-hoodie');expect(searchProducts('no such garment')).toHaveLength(0);});
});

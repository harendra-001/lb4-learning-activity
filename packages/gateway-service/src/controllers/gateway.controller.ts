import {get, param} from '@loopback/rest';
import axios from 'axios';

export class GatewayController {
  private orderServiceUrl: string;
  private productServiceUrl: string;
  private userServiceUrl: string;

  constructor() {
    this.orderServiceUrl = process.env.ORDER_SERVICE_URL || 'http://localhost:3002';
    this.productServiceUrl = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001';
    this.userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3003';
  }

  @get('/combined-data/{orderId}') // To get {order, user, product}; 
  async getCombinedData(@param.path.number('orderId') orderId: number): Promise<object> {

    let order, product, user;

    try {
        
        // NExt task: Use rest connector at axios
        const orderResponse = await axios.get(`${this.orderServiceUrl}/orders/${orderId}`);
        order = orderResponse.data;
        console.log('Order Response:', order);
      } catch (error) {
        console.error('Error fetching order:', error.message);
        throw error;
      }

    try {
        const productResponse = await axios.get(`${this.productServiceUrl}/products/${order.productId}`);
        product = productResponse.data;
        console.log('Product Response:', product);
      } catch (error) {
        console.error('Error fetching product:', error.message);
        throw error;
      }

      try {
        const userResponse = await axios.get(`${this.userServiceUrl}/users/${order.customerId}`);
        user = userResponse.data;
        console.log('User Response:', user);
      } catch (error) {
        console.error('Error fetching user:', error.message);
        throw error;
      }

    return {order, user, product};
  }
}

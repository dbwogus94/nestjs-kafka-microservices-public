import { Injectable } from '@nestjs/common';
import { Stock } from './stock.entity';

@Injectable()
export class AppService {
  async createStock(productId: number) {
    const stock = Stock.create({ productId });
    // throw new RpcException('에러 테스트');
    // 여기서 에려 발생시 오프셋 롤백된다.
    // TODO: @EventPattern은 에러를 api-gateway로 전달할 방법은 없다.
    // 그렇다면? 이전 서비스에 오류를 어떻게 전달 할 수 있을까?
    await Stock.save(stock);
  }

  async deleteStock(productId: number) {
    const stock = await Stock.findOne({ where: { productId } });
    await stock.softRemove();
  }
}

import {
  HttpException,
  Inject,
  Injectable,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { lastValueFrom, timeout } from 'rxjs';
import { CreateProductDTO, UpdateProductDTO } from './product.dto';

/* 
  ## .send() vs .emit()

  ### send() 사용의미
  - @MessagePattern()에 대응하여 사용한다.
  - 메세지 패턴은 요청-응답 매커니즘을 사용한다. 
  - 즉, @MessagePattern()사용하면 응답이 완료까지 무한정으로 대기하게 된다.
  - nest msa에서는 요청-응답을 구현하기 위해 논리적으로 2개의 채널을 생성해 사용한다.
  - 2개의 채널을 사용하기 위해 토픽도 2개 생성하여 사용한다. 
  - 2개의 채널을 사용하기 위해 Consumer Group도 2개를 생성해 사용한다.
  - send()는 rxjs의 Cold observable을 리턴한다. ( === 유니케스트 )
  - @MessagePattern()을 사용하기 위해서는 컨트롤러에 onModuleInit() {...}로직을 구해야한다. 

  ### emit() 사용의미
  - @EventPattern()에 대응하여 사용한다.
  - 이벤트 패턴은 기본적으로 이벤트 매커니즘을 사용한다.
  - 즉, @EventPattern()를 사용하면 응답을 기다리지 않고 처리가 가능하다.
  - nest msa에서는 이벤트 패턴을 구현하기 위해 논리적으로 1개의 채널을 사용한다.
  - 1개의 채널을 사용하기 때문에 1개의 토픽을 생성한다.
  - 1개의 채널을 사용하기 때문에 1개의 Consumer Group을 사용한다. (하지만 기본적으로 생성은 2개를 한다.)
  - emit()는 rxjs의 Hot observable를 리턴한다. === 멀티케스트
*/

@Injectable()
export class ProductService {
  // constructor() {}

  getProducts() {}

  async getProduct(@Param('id', ParseIntPipe) productId: number) {}

  createProduct(createDto: CreateProductDTO) {}

  async updateProduct(
    @Param('id', ParseIntPipe) productId: number,
    updateDto: UpdateProductDTO,
  ) {}

  async deleteProduct(
    @Param('id', ParseIntPipe) productId: number,
  ): Promise<void> {}
}

import { Controller } from '@nestjs/common';
import { AppService } from './app.service';

/*
  TODO: 구조 변경 중 

  1)
  request => 프론트 컨틀롤러에서 분기 작업
    if(게이트웨이에서 온 요청) ProductController => ProductService => DB
    else if(내부에서온 요청) 상품_프로듀스_Controller => 상품_프로튜스_서비스 => 카프카 토픽으로 메세지 전송
    
    **상품_컨슈머 => 토픽에서 메세지 poll => ProductService => DB

  2)
  request => 인터셉터에서 분기 작업 
    if(게이트웨이에서 온 요청) ProductController => ProductService => DB
    else if(내부에서 온 요청) 인터셉터 => ProducerController => ProductService 사용하여 404 체크  => 카프카 
    
    카프카 => ProductConsumer =>  ProductService => DB

 */

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
}

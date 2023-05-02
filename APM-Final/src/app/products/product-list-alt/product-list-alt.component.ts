import { ChangeDetectionStrategy, Component } from '@angular/core';
import { catchError, combineLatest, EMPTY, map, Subject } from 'rxjs';

import { ProductService } from '../product.service';

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list-alt.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush // because we are binding to Observables, detects changes to observables bound in the template using async pipe
})
export class ProductListAltComponent {
  pageTitle = 'Products';
  private errorMessageSubject = new Subject<string>();
  errorMessage$ = this.errorMessageSubject.asObservable();

  products$ = this.productService.productsWithCategory$
    .pipe(
      catchError(err => {
        this.errorMessageSubject.next(err); // set a value into a subject stream
        return EMPTY;
      })
    );

  selectedProduct$ = this.productService.selectedProduct$;

  vm$ = combineLatest([
    this.products$,
    this.selectedProduct$
  ])
    .pipe(
      map(([products, product]) =>
        ({ products, productId: product ? product.id : 0 }))
    );

  constructor(private productService: ProductService) { }

  onSelected(productId: number): void {
    this.productService.selectedProductChanged(productId); // you called the a centralized emiter
  }
}

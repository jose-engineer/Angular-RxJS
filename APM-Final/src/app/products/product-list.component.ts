import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject, catchError, combineLatest, EMPTY, map, Subject } from 'rxjs';

import { ProductCategoryService } from '../product-categories/product-category.service';
import { ProductService } from './product.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  pageTitle = 'Product List';
  private errorMessageSubject = new Subject<string>();
  errorMessage$ = this.errorMessageSubject.asObservable();

  private categorySelectedSubject = new BehaviorSubject<number>(0);
  categorySelectedAction$ = this.categorySelectedSubject.asObservable();

   products$ = combineLatest([//emits after both observables have emitted, and then again each time the action stream emits, combine data plus the latest action info
  //when combineLates emits, it refires the downstream pipeline, so if the pipeline filters the data it will perform the filter again
    this.productService.productsWithAdd$, // [ [{p1},{p2},{p3}],
    this.categorySelectedAction$ // garden ]
  ])
    .pipe(
      map(([products, selectedCategoryId]) =>
        products.filter(product =>
          selectedCategoryId ? product.categoryId === selectedCategoryId : true //if no match, return true to return all products
        )),
      catchError(err => {
        this.errorMessageSubject.next(err);
        return EMPTY;
      })
    );

  categories$ = this.productCategoryService.productCategories$
    .pipe(
      catchError(err => {
        this.errorMessageSubject.next(err);
        return EMPTY;
      })
    );

  vm$ = combineLatest([
    this.products$,
    this.categories$
  ])
    .pipe(
      map(([products, categories]) =>
        ({ products, categories }))
    );

  constructor(private productService: ProductService,
              private productCategoryService: ProductCategoryService) { }

  onAdd(): void {
    this.productService.addProduct();
  }

  onSelected(categoryId: string): void {
    this.categorySelectedSubject.next(+categoryId); // use plus sign to cast to a number, so the === match the value
  }
}

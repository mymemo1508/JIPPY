package com.hbhw.jippy;

import com.hbhw.jippy.domain.product.dto.request.RecipeRequest;
import com.hbhw.jippy.domain.product.dto.request.SearchRecipeRequest;
import com.hbhw.jippy.domain.product.entity.Ingredient;
import com.hbhw.jippy.domain.product.entity.Product;
import com.hbhw.jippy.domain.product.entity.Recipe;
import com.hbhw.jippy.domain.product.repository.RecipeCustomRepository;
import com.hbhw.jippy.domain.product.repository.RecipeRepository;
import com.hbhw.jippy.domain.product.service.ProductService;
import com.hbhw.jippy.domain.product.service.RecipeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.times;
import static org.junit.jupiter.api.Assertions.*;

@MockitoSettings(strictness = Strictness.LENIENT)
@ExtendWith(MockitoExtension.class)
public class RecipeServiceTest {

    @InjectMocks
    private RecipeService recipeService;
    @Mock
    private RecipeRepository recipeRepository;
    @Mock
    private RecipeCustomRepository recipeCustomRepository;
    @Mock
    private ProductService productService;

    private RecipeRequest mockRequestRecipe;

    @BeforeEach
    void setUp() {
        Ingredient mockIngredient1 = new Ingredient("원두", 10, "g");
        Ingredient mockIngredient2 = new Ingredient("바닐라시럽", 20, "ml");
        List<Ingredient> mockIngredientList = Arrays.asList(mockIngredient1, mockIngredient2);
        mockRequestRecipe = new RecipeRequest(1L, "2024-01-15", mockIngredientList);
    }

    @Test
    void createRecipeTest_Success() {
        // given
        // when
        recipeService.createRecipe(mockRequestRecipe);
        // then
        verify(recipeRepository, times(1)).save(any(Recipe.class));
    }

    @Test
    void deleteRecipe_Success(){
        //given
        Product mockProduct = new Product();
        SearchRecipeRequest mockSearchRecipeRequest = new SearchRecipeRequest(1L, 1);
        Recipe mockRecipe = new Recipe();
        when(productService.getProduct(anyInt(), anyLong())).thenReturn(mockProduct);
        when(recipeRepository.findByProductId(anyLong())).thenReturn(Optional.of(mockRecipe));

        // when
        recipeService.deleteRecipe(mockSearchRecipeRequest);

        // then
        verify(productService, times(1)).getProduct(1, 1L);
        verify(recipeRepository, times(1)).findByProductId(1L);
        verify(recipeRepository, times(1)).delete(mockRecipe);
    }

    @Test
    void modifyRecipe_Success(){
        Recipe mockData = getMockRecipe();
        Recipe mockRecipe = Recipe.builder()
                .productId(1L)
                .ingredient(mockData.getIngredient())
                .updatedAt("1999-01-15")
                .build();
        when(recipeRepository.findByProductId(anyLong())).thenReturn(Optional.ofNullable(mockRecipe));

        recipeService.modifyRecipe(mockRequestRecipe);

        assert mockRecipe != null;
        assertEquals("1999-01-15", mockRecipe.getUpdatedAt());
        verify(recipeCustomRepository, times(1)).updateRecipe(mockRequestRecipe);
    }

    public Recipe getMockRecipe() {
        Ingredient mockIngredient1 = mock(Ingredient.class);
        when(mockIngredient1.getName()).thenReturn("원두");
        when(mockIngredient1.getAmount()).thenReturn(10);
        when(mockIngredient1.getUnit()).thenReturn("g");

        Ingredient mockIngredient2 = mock(Ingredient.class);
        when(mockIngredient2.getName()).thenReturn("바닐라시럽");
        when(mockIngredient2.getAmount()).thenReturn(20);
        when(mockIngredient2.getUnit()).thenReturn("mL");

        // mock Ingredient 리스트 생성
        List<Ingredient> mockIngredientList = Arrays.asList(mockIngredient1, mockIngredient2);

        Recipe mockRecipe = mock(Recipe.class);
        when(mockRecipe.getProductId()).thenReturn(1L);
        when(mockRecipe.getUpdatedAt()).thenReturn("2024-01-15 11:11:11");
        when(mockRecipe.getIngredient()).thenReturn(mockIngredientList);

        return mockRecipe;
    }

}

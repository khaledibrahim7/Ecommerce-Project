package com.sowar.store.service.impl;




import com.sowar.store.dto.*;
import com.sowar.store.entity.*;
import com.sowar.store.entity.enums.PromotionType;
import com.sowar.store.repository.*;
import com.sowar.store.common.ApiException;
import com.sowar.store.common.NotFoundException;
import com.sowar.store.service.CatalogService;
import com.sowar.store.service.LowStockNotificationService;
import com.sowar.store.service.promotion.PromotionStrategyFactory;
import com.sowar.store.mapper.ProductMapper;
import com.sowar.store.mapper.CategoryMapper;
import com.sowar.store.mapper.QuestionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CatalogServiceImpl implements CatalogService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductQuestionRepository productQuestionRepository;
    private final UserRepository userRepository;
    private final LowStockNotificationService lowStockNotificationService;
    private final PromotionStrategyFactory promotionStrategyFactory;
    private final ProductMapper productMapper;
    private final CategoryMapper categoryMapper;
    private final QuestionMapper questionMapper;


    @Transactional(readOnly = true)
    public List<ProductResponse> listPublicProducts() {
        return productRepository.findByActiveTrueOrderBySortOrderAsc().stream().map(productMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> searchPublicProducts(String q, Long categoryId, Boolean featured) {
        return productRepository.findAll(productSpec(q, categoryId, featured, true))
                .stream()
                .map(productMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> searchPublicProductsPage(String q, Long categoryId, Boolean featured, int page, int size, String sort) {
        Sort sortSpec = switch (sort == null ? "featured" : sort) {
            case "priceAsc" -> Sort.by("price").ascending();
            case "priceDesc" -> Sort.by("price").descending();
            case "newest" -> Sort.by("createdAt").descending();
            default -> Sort.by("sortOrder").ascending().and(Sort.by("createdAt").descending());
        };
        return PageResponse.from(productRepository.findAll(productSpec(q, categoryId, featured, true), PageRequest.of(page, size, sortSpec))
                .map(productMapper::toResponse));
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> listAllProducts() {
        return productRepository.findAll().stream().map(productMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> lowStockProducts() {
        return productRepository.findAll().stream()
                .filter(product -> product.getStockQuantity() <= product.getLowStockThreshold())
                .map(productMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse getProduct(Long id) {
        return productRepository.findWithImagesById(id)
                .map(productMapper::toResponse)
                .orElseThrow(() -> new NotFoundException("Product not found"));
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Product product = new Product();
        apply(product, request);
        return productMapper.toResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = findProduct(id);
        apply(product, request);
        return productMapper.toResponse(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = findProduct(id);
        product.setDeleted(true);
        product.setDeletedAt(Instant.now());
        productRepository.save(product);
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = findCategory(id);
        category.setName(request.name());
        category.setDescription(request.description());
        return categoryMapper.toResponse(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        if (productRepository.existsByCategoryId(id)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Category is used by products");
        }
        Category category = findCategory(id);
        category.setDeleted(true);
        category.setDeletedAt(Instant.now());
        categoryRepository.save(category);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> listCategories() {
        return categoryRepository.findAll().stream().map(categoryMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<QuestionResponse> listProductQuestions(Long productId) {
        return productQuestionRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(questionMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<QuestionResponse> listAllQuestions() {
        return productQuestionRepository.findAll().stream()
                .map(questionMapper::toResponse)
                .toList();
    }

    @Transactional
    public QuestionResponse askQuestion(Long customerId, Long productId, QuestionRequest request) {
        Product product = findProduct(productId);
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        ProductQuestion question = new ProductQuestion();
        question.setProduct(product);
        question.setCustomer(customer);
        question.setQuestion(request.question());
        return questionMapper.toResponse(productQuestionRepository.save(question));
    }

    @Transactional
    public QuestionResponse answerQuestion(Long questionId, QuestionAnswerRequest request) {
        ProductQuestion question = productQuestionRepository.findById(questionId)
                .orElseThrow(() -> new NotFoundException("Question not found"));
        question.setAnswer(request.answer());
        question.setAnswered(true);
        return questionMapper.toResponse(question);
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        Category category = new Category();
        category.setName(request.name());
        category.setDescription(request.description());
        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    private void apply(Product product, ProductRequest request) {
        product.setName(request.name());
        product.setDescription(request.description());
        product.setWeight(request.weight());
        product.setIngredients(request.ingredients());
        product.setUsageInstructions(request.usageInstructions());
        product.setStorageInstructions(request.storageInstructions());
        product.setOrigin(request.origin());
        product.setFeatured(request.featured());
        product.setSortOrder(request.sortOrder());
        product.setPrice(request.price());
        product.setOriginalPrice(request.originalPrice());
        product.setCost(request.cost());
        PromotionType promotionType = request.promotionType() == null ? PromotionType.NONE : request.promotionType();
        product.setPromotionType(promotionType);
        product.setPromotionTitle(request.promotionTitle());
        product.setPromotionDescription(request.promotionDescription());
        product.setGiftQuantity(request.giftQuantity());
        product.setGiftProduct(null);
        
        promotionStrategyFactory.getStrategy(promotionType).validateConfig(product, request, productRepository);

        product.setStockQuantity(request.stockQuantity());
        product.setLowStockThreshold(request.lowStockThreshold());
        product.setActive(request.active());
        product.setImageUrls(request.imageUrls() == null ? new ArrayList<>() : new ArrayList<>(request.imageUrls()));
        product.setCategory(request.categoryId() == null ? null : categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Category not found")));
        lowStockNotificationService.notifyIfLow(product);
    }

    private Product findProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found"));
    }

    private Specification<Product> productSpec(String q, Long categoryId, Boolean featured, boolean activeOnly) {
        return (root, query, builder) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            if (activeOnly) {
                predicates.add(builder.isTrue(root.get("active")));
            }
            if (q != null && !q.isBlank()) {
                String pattern = "%" + q.toLowerCase() + "%";
                predicates.add(builder.or(
                        builder.like(builder.lower(root.get("name")), pattern),
                        builder.like(builder.lower(root.get("description")), pattern)
                ));
            }
            if (categoryId != null) {
                predicates.add(builder.equal(root.get("category").get("id"), categoryId));
            }
            if (featured != null) {
                predicates.add(builder.equal(root.get("featured"), featured));
            }
            query.orderBy(builder.asc(root.get("sortOrder")), builder.desc(root.get("createdAt")));
            return builder.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    private Category findCategory(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Category not found"));
    }
}


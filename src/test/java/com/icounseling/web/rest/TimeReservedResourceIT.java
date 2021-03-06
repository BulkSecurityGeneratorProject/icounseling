package com.icounseling.web.rest;

import com.icounseling.ICounselingApp;
import com.icounseling.domain.TimeReserved;
import com.icounseling.repository.TimeReservedRepository;
import com.icounseling.service.TimeReservedService;
import com.icounseling.service.dto.TimeReservedDTO;
import com.icounseling.service.mapper.TimeReservedMapper;
import com.icounseling.web.rest.errors.ExceptionTranslator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.Validator;

import javax.persistence.EntityManager;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static com.icounseling.web.rest.TestUtil.createFormattingConversionService;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for the {@link TimeReservedResource} REST controller.
 */
@SpringBootTest(classes = ICounselingApp.class)
public class TimeReservedResourceIT {

    private static final Instant DEFAULT_DATE_TIME = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_DATE_TIME = Instant.now().truncatedTo(ChronoUnit.MILLIS);
    private static final Instant SMALLER_DATE_TIME = Instant.ofEpochMilli(-1L);

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    @Autowired
    private TimeReservedRepository timeReservedRepository;

    @Autowired
    private TimeReservedMapper timeReservedMapper;

    @Autowired
    private TimeReservedService timeReservedService;

    @Autowired
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    @Autowired
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;

    @Autowired
    private ExceptionTranslator exceptionTranslator;

    @Autowired
    private EntityManager em;

    @Qualifier("defaultValidator")
    @Autowired
    private Validator validator;

    private MockMvc restTimeReservedMockMvc;

    private TimeReserved timeReserved;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final TimeReservedResource timeReservedResource = new TimeReservedResource(timeReservedService);
        this.restTimeReservedMockMvc = MockMvcBuilders.standaloneSetup(timeReservedResource)
            .setCustomArgumentResolvers(pageableArgumentResolver)
            .setControllerAdvice(exceptionTranslator)
            .setConversionService(createFormattingConversionService())
            .setMessageConverters(jacksonMessageConverter)
            .setValidator(validator).build();
    }

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static TimeReserved createEntity(EntityManager em) {
        TimeReserved timeReserved = new TimeReserved()
            .dateTime(DEFAULT_DATE_TIME)
            .description(DEFAULT_DESCRIPTION);
        return timeReserved;
    }
    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static TimeReserved createUpdatedEntity(EntityManager em) {
        TimeReserved timeReserved = new TimeReserved()
            .dateTime(UPDATED_DATE_TIME)
            .description(UPDATED_DESCRIPTION);
        return timeReserved;
    }

    @BeforeEach
    public void initTest() {
        timeReserved = createEntity(em);
    }

    @Test
    @Transactional
    public void createTimeReserved() throws Exception {
        int databaseSizeBeforeCreate = timeReservedRepository.findAll().size();

        // Create the TimeReserved
        TimeReservedDTO timeReservedDTO = timeReservedMapper.toDto(timeReserved);
        restTimeReservedMockMvc.perform(post("/api/time-reserveds")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(timeReservedDTO)))
            .andExpect(status().isCreated());

        // Validate the TimeReserved in the database
        List<TimeReserved> timeReservedList = timeReservedRepository.findAll();
        assertThat(timeReservedList).hasSize(databaseSizeBeforeCreate + 1);
        TimeReserved testTimeReserved = timeReservedList.get(timeReservedList.size() - 1);
        assertThat(testTimeReserved.getDateTime()).isEqualTo(DEFAULT_DATE_TIME);
        assertThat(testTimeReserved.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
    }

    @Test
    @Transactional
    public void createTimeReservedWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = timeReservedRepository.findAll().size();

        // Create the TimeReserved with an existing ID
        timeReserved.setId(1L);
        TimeReservedDTO timeReservedDTO = timeReservedMapper.toDto(timeReserved);

        // An entity with an existing ID cannot be created, so this API call must fail
        restTimeReservedMockMvc.perform(post("/api/time-reserveds")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(timeReservedDTO)))
            .andExpect(status().isBadRequest());

        // Validate the TimeReserved in the database
        List<TimeReserved> timeReservedList = timeReservedRepository.findAll();
        assertThat(timeReservedList).hasSize(databaseSizeBeforeCreate);
    }


    @Test
    @Transactional
    public void checkDateTimeIsRequired() throws Exception {
        int databaseSizeBeforeTest = timeReservedRepository.findAll().size();
        // set the field null
        timeReserved.setDateTime(null);

        // Create the TimeReserved, which fails.
        TimeReservedDTO timeReservedDTO = timeReservedMapper.toDto(timeReserved);

        restTimeReservedMockMvc.perform(post("/api/time-reserveds")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(timeReservedDTO)))
            .andExpect(status().isBadRequest());

        List<TimeReserved> timeReservedList = timeReservedRepository.findAll();
        assertThat(timeReservedList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void checkDescriptionIsRequired() throws Exception {
        int databaseSizeBeforeTest = timeReservedRepository.findAll().size();
        // set the field null
        timeReserved.setDescription(null);

        // Create the TimeReserved, which fails.
        TimeReservedDTO timeReservedDTO = timeReservedMapper.toDto(timeReserved);

        restTimeReservedMockMvc.perform(post("/api/time-reserveds")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(timeReservedDTO)))
            .andExpect(status().isBadRequest());

        List<TimeReserved> timeReservedList = timeReservedRepository.findAll();
        assertThat(timeReservedList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllTimeReserveds() throws Exception {
        // Initialize the database
        timeReservedRepository.saveAndFlush(timeReserved);

        // Get all the timeReservedList
        restTimeReservedMockMvc.perform(get("/api/time-reserveds?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(timeReserved.getId().intValue())))
            .andExpect(jsonPath("$.[*].dateTime").value(hasItem(DEFAULT_DATE_TIME.toString())))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION.toString())));
    }
    
    @Test
    @Transactional
    public void getTimeReserved() throws Exception {
        // Initialize the database
        timeReservedRepository.saveAndFlush(timeReserved);

        // Get the timeReserved
        restTimeReservedMockMvc.perform(get("/api/time-reserveds/{id}", timeReserved.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(timeReserved.getId().intValue()))
            .andExpect(jsonPath("$.dateTime").value(DEFAULT_DATE_TIME.toString()))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingTimeReserved() throws Exception {
        // Get the timeReserved
        restTimeReservedMockMvc.perform(get("/api/time-reserveds/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateTimeReserved() throws Exception {
        // Initialize the database
        timeReservedRepository.saveAndFlush(timeReserved);

        int databaseSizeBeforeUpdate = timeReservedRepository.findAll().size();

        // Update the timeReserved
        TimeReserved updatedTimeReserved = timeReservedRepository.findById(timeReserved.getId()).get();
        // Disconnect from session so that the updates on updatedTimeReserved are not directly saved in db
        em.detach(updatedTimeReserved);
        updatedTimeReserved
            .dateTime(UPDATED_DATE_TIME)
            .description(UPDATED_DESCRIPTION);
        TimeReservedDTO timeReservedDTO = timeReservedMapper.toDto(updatedTimeReserved);

        restTimeReservedMockMvc.perform(put("/api/time-reserveds")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(timeReservedDTO)))
            .andExpect(status().isOk());

        // Validate the TimeReserved in the database
        List<TimeReserved> timeReservedList = timeReservedRepository.findAll();
        assertThat(timeReservedList).hasSize(databaseSizeBeforeUpdate);
        TimeReserved testTimeReserved = timeReservedList.get(timeReservedList.size() - 1);
        assertThat(testTimeReserved.getDateTime()).isEqualTo(UPDATED_DATE_TIME);
        assertThat(testTimeReserved.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    public void updateNonExistingTimeReserved() throws Exception {
        int databaseSizeBeforeUpdate = timeReservedRepository.findAll().size();

        // Create the TimeReserved
        TimeReservedDTO timeReservedDTO = timeReservedMapper.toDto(timeReserved);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restTimeReservedMockMvc.perform(put("/api/time-reserveds")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(timeReservedDTO)))
            .andExpect(status().isBadRequest());

        // Validate the TimeReserved in the database
        List<TimeReserved> timeReservedList = timeReservedRepository.findAll();
        assertThat(timeReservedList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteTimeReserved() throws Exception {
        // Initialize the database
        timeReservedRepository.saveAndFlush(timeReserved);

        int databaseSizeBeforeDelete = timeReservedRepository.findAll().size();

        // Delete the timeReserved
        restTimeReservedMockMvc.perform(delete("/api/time-reserveds/{id}", timeReserved.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<TimeReserved> timeReservedList = timeReservedRepository.findAll();
        assertThat(timeReservedList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(TimeReserved.class);
        TimeReserved timeReserved1 = new TimeReserved();
        timeReserved1.setId(1L);
        TimeReserved timeReserved2 = new TimeReserved();
        timeReserved2.setId(timeReserved1.getId());
        assertThat(timeReserved1).isEqualTo(timeReserved2);
        timeReserved2.setId(2L);
        assertThat(timeReserved1).isNotEqualTo(timeReserved2);
        timeReserved1.setId(null);
        assertThat(timeReserved1).isNotEqualTo(timeReserved2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(TimeReservedDTO.class);
        TimeReservedDTO timeReservedDTO1 = new TimeReservedDTO();
        timeReservedDTO1.setId(1L);
        TimeReservedDTO timeReservedDTO2 = new TimeReservedDTO();
        assertThat(timeReservedDTO1).isNotEqualTo(timeReservedDTO2);
        timeReservedDTO2.setId(timeReservedDTO1.getId());
        assertThat(timeReservedDTO1).isEqualTo(timeReservedDTO2);
        timeReservedDTO2.setId(2L);
        assertThat(timeReservedDTO1).isNotEqualTo(timeReservedDTO2);
        timeReservedDTO1.setId(null);
        assertThat(timeReservedDTO1).isNotEqualTo(timeReservedDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(timeReservedMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(timeReservedMapper.fromId(null)).isNull();
    }
}

package com.example.tetris;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.tetris.repository.ScoreRepository;
import com.example.tetris.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class AuthAndScoreApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ScoreRepository scoreRepository;

    @BeforeEach
    void clean() {
        scoreRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void signupStoresBcryptPasswordAndRejectsDuplicateUsername() throws Exception {
        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentials("player", "secret")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("player"))
                .andExpect(jsonPath("$.password").doesNotExist());

        assertThat(userRepository.findByUsername("player").orElseThrow().getPassword()).startsWith("$2");

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentials("player", "secret")))
                .andExpect(status().isConflict());
    }

    @Test
    void loginThenSaveScoreRequiresSessionAndShowsUsername() throws Exception {
        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentials("player", "secret")))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/scores")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(scoreJson(1200, 4)))
                .andExpect(status().isUnauthorized());

        MvcResult login = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentials("player", "secret")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("player"))
                .andReturn();
        MockHttpSession session = (MockHttpSession) login.getRequest().getSession(false);
        assertThat(session).isNotNull();

        mockMvc.perform(post("/api/scores")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(scoreJson(1200, 4)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("player"))
                .andExpect(jsonPath("$.score").value(1200));

        mockMvc.perform(get("/api/scores/top"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username").value("player"))
                .andExpect(jsonPath("$[0].score").value(1200));

        mockMvc.perform(get("/api/auth/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("player"));

        mockMvc.perform(post("/api/auth/logout").session(session))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/auth/me").session(session))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void loginWithWrongPasswordIsUnauthorized() throws Exception {
        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentials("player", "secret")))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentials("player", "wrong")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void pagesOutsideApiDoNotRequireLogin() throws Exception {
        mockMvc.perform(get("/index.html"))
                .andExpect(result -> assertThat(result.getResponse().getStatus()).isNotEqualTo(401));
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void blankSignupIsBadRequest() throws Exception {
        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentials(" ", "secret")))
                .andExpect(status().isBadRequest());
    }

    private String credentials(String username, String password) {
        return "{\"username\":\"" + username + "\",\"password\":\"" + password + "\"}";
    }

    private String scoreJson(int score, int clearedLines) {
        return "{\"score\":" + score + ",\"clearedLines\":" + clearedLines + "}";
    }
}
